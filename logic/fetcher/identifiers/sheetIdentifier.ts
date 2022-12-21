import { inject, injectable } from "inversify";
import { WorkSheet } from "xlsx";
import { IFileManager } from "../../fs/fileManager.types";
import { ILogger } from "../../logger/types";
import { AppFiles, TransactionBaseData } from "../../shared.types";
import { LOGIC_TYPES } from "../../types";
import { IExcelProcessor } from "../excel/excelProcessor.types";
import { BaseDataColumnOptions, CellIdentifiers, EnhancedSheetGuide, IDateFormatAnalyzer, SheetGuide } from "./identifier.types";

const CELL_SEARCH_ROW_COUNT = 40
const CELL_SEARCH_COL_COUNT = 20

const CELL_SEARCH_LARGE_INDEX = 10000

/**
 * This class identifies excel sheets by parsing them and finding the relevant
 * columns for calculations.
 * Trying to facilitate the user's work - the code will attempt to identify relevant fields
 * automatically (dates, amounts, description) if possible. In cases where it's not possible, the
 * process will fail unless there's a descriptor telling it where the proper data is located.
 * 
 * The main output is a data guide that says exactly where each data is, what kind of sheet this is
 * and any other additional metadata required.
 * 
 * In case identification fails - the sheet should provide an error descriptor - explaining which data
 * points could not be identified.
 * 
 * Identification is based on a set of keys that should describe the relevant columns. for example, we could search for
 * a column called 'amount' and assume everything under this column is the amount of the transaction.
 */
@injectable()
export class SheetIdentifier {
	private logger: ILogger
	private excelProcessor: IExcelProcessor
	private dateAnalyzer: IDateFormatAnalyzer
	private fileMgr: IFileManager

	private sheetGuides: SheetGuide[] 
	private columnOptions: BaseDataColumnOptions

	constructor(
		@inject(LOGIC_TYPES.ILogger) logger: ILogger,
		@inject(LOGIC_TYPES.IExcelProcessor) excelProcessor: IExcelProcessor,
		@inject(LOGIC_TYPES.IDateFromatAnalyzer) dateAnalyzer: IDateFormatAnalyzer,
		@inject(LOGIC_TYPES.IFileManager) fileMgr: IFileManager,
	) {
		this.logger = logger
		this.excelProcessor = excelProcessor
		this.dateAnalyzer = dateAnalyzer
		this.fileMgr = fileMgr

		this.sheetGuides = []
		this.columnOptions = {
			description: [],
			date: [],
			billDate: [],
			amount: [],
		}
		this.init()
	}

	private async loadSheetGuide() {
		if (await this.fileMgr.exists(AppFiles.Identifiers)) {
			this.sheetGuides = await this.fileMgr.fileAsJson<SheetGuide[]>(AppFiles.Identifiers)
			this.sheetGuides.forEach((g) => this.logger.log(`Found sheet guide "${g.name}"`))
			return
		}
		
		this.logger.log('Sheet guide not found. creating empty guide.')
		return this.saveGuides()
	}

	private async loadColumnOptions() {
		if (await this.fileMgr.exists(AppFiles.DataColumnOptions)) {
			this.columnOptions = await this.fileMgr.fileAsJson<BaseDataColumnOptions>(AppFiles.DataColumnOptions)
			return
		}
		
		this.logger.log('Column options not found. Using empty structure.')
	}

	public async init() {
		await this.loadSheetGuide()
		await this.loadColumnOptions()
	}

	private async saveGuides() {
		return this.fileMgr.writeJsonToFile(AppFiles.Identifiers, this.sheetGuides)
	}

	private sheetMatch = (sheet: WorkSheet, cells: CellIdentifiers[]) => {
		if (!cells || cells.length === 0) {
			//TODO change to log
			console.error('Empty identifier will never match')
			return false
		}
		const mismatches = cells.filter((c) => this.excelProcessor.cellValue(sheet, c.row, c.column).trim() !== c.value.trim()).length
		if (mismatches > 0) return false
		
		return true
	}

	public identify(sheet: WorkSheet): EnhancedSheetGuide|null {
		const guide = this.sheetGuides.find((g) => this.sheetMatch(sheet, g.identifiers))
		if (!guide) return null
		return this.enhance(sheet, guide)
	}

	private enhance(sheet: WorkSheet, guide: SheetGuide): EnhancedSheetGuide|null {
		// if we have all data - return.
		if (guide.startRow && guide.endRow && guide.amount && guide.billDate && guide.date && guide.description) return guide as EnhancedSheetGuide

		// start with the existing guide from disk.
		const getBaseDataHeader = (field: keyof TransactionBaseData) => {
			if (guide.startRow && guide[field]) return { col: guide[field] as number, row: guide.startRow }
			return this.excelProcessor.searchCell(sheet, 0, CELL_SEARCH_ROW_COUNT, 0, CELL_SEARCH_COL_COUNT, this.columnOptions[field])
		}

		// search for the location of all base fields
		const amountLoc = getBaseDataHeader('amount')
		const descriptionLoc = getBaseDataHeader('description')
		const dateLoc = getBaseDataHeader('date')
		const billDateLoc = getBaseDataHeader('billDate') || getBaseDataHeader('date') // if billDate doesn't exist we use the same as date
		
		const error = (msg: string) => { console.log(msg); return null }
		if (!amountLoc) return error('Cannot find the `amount` column')
		if (!descriptionLoc) return error('Cannot find the `description` column')
		if (!dateLoc) return error('Cannot find the `date` column')

		// verify all locations match
		if (amountLoc?.row !== descriptionLoc?.row || amountLoc?.row !== dateLoc?.row || amountLoc?.row !== billDateLoc?.row ) {
			console.error('mis-aligned locations for the base data objects', amountLoc, descriptionLoc, dateLoc, billDateLoc)
			return null
		}

		// to find the last line, first look for the first empty line. 
		// then check if the previous line is a summary line. if so - skip it.
		const findLastLine = () => {
			// search for first space.
			const amountSpaceLoc = this.excelProcessor.searchCell(sheet, amountLoc.row + 1, CELL_SEARCH_LARGE_INDEX, amountLoc.col, amountLoc.col + 1, [''])
			const descriptionSpaceLoc = this.excelProcessor.searchCell(sheet, descriptionLoc.row + 1, CELL_SEARCH_LARGE_INDEX, descriptionLoc.col, descriptionLoc.col + 1, [''])
			const dateSpaceLoc = this.excelProcessor.searchCell(sheet, dateLoc.row + 1, CELL_SEARCH_LARGE_INDEX, dateLoc.col, dateLoc.col + 1, [''])
			const spaceLoc = {
				row: Math.min(amountSpaceLoc?.row || CELL_SEARCH_LARGE_INDEX, descriptionSpaceLoc?.row || CELL_SEARCH_LARGE_INDEX, dateSpaceLoc?.row || CELL_SEARCH_LARGE_INDEX),
				col: amountSpaceLoc?.col || 0,
			}
			if (spaceLoc.row === CELL_SEARCH_LARGE_INDEX) throw new Error('Unexpected error - could not find space cell when searching for last line')

			//check if last line is a summary. by comparing the sum of the amount column to the cell of the last line.
			const sum = parseFloat(this.excelProcessor.sum(sheet, amountLoc.row + 1, spaceLoc.row - 1, amountLoc.col, amountLoc.col + 1).toFixed(2))
			const lastLineVal = parseFloat(this.excelProcessor.cellCurrencyValue(sheet, spaceLoc.row - 1, spaceLoc.col).toFixed(2))
			if (sum === lastLineVal) return spaceLoc.row - 1
			return spaceLoc.row
		}

		const endRow = guide.endRow || findLastLine()
		// there's an assumption here that the bill date format and the date format are the same.
		const dateFormat = this.dateAnalyzer.analyze(sheet, dateLoc.col, dateLoc.row + 1, endRow)
		console.log(dateFormat)

		return {
			...guide,
			startRow: amountLoc.row,
			endRow,
			amount: amountLoc.col,
			description: descriptionLoc.col,
			date: dateLoc.col,
			billDate: billDateLoc.col,
			dateFormat: dateFormat
		}
	}
}