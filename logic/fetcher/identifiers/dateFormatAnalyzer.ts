import 'reflect-metadata'
import { inject, injectable } from "inversify";
import { WorkSheet } from "xlsx";
import { IDateFormatAnalyzer } from "./identifier.types";
import { IExcelProcessor } from '../excel/excelProcessor.types';
import moment from 'moment';
import { LOGIC_TYPES } from '../../types';

/**
 * This class tries to analyze a column of dates from an excel worksheet.
 * Assumptions:
 *   - The relevant dates are all in a single column
 *   - The dates in the worksheet are monotonous. i.e. date in higher rows are later or equal to previous rows.
 *   - some aspects of the analysis assume that the fields in the input are all of the same pattern / type.
 * 
 * Method: 
 *   1. Hope the excel data type is a date and then we don't need a date format since we already know what it is.
 *   2. If we need to analyze - the algorithm will try several approaches, and for each - test if all dates are monotonous.
 *       if they are monotonous - we assume we found the right date format.
 *   3. try to simply call 'new Date' with the string as is. if it works - we don't need a specific date format.
 *   4. Try to parse the date format:
 *     4.1 expect the date string to have 2 type of chars: number, and delimiters. there should be just 2 delimiters of the same char.
 *         if the date has more than 2 delimiters, or delimiters of different chars - throw an error. analysis failed.
 *     4.2 using the found delimiter, we can find 2 date parts (month day year). there are 6 options of how this can work (or 4 if there's a 4 chars year). 
 *         try each of the available options and test with the monotonous assumption.
 */
@injectable()
export class DateFormatAnalyzer implements IDateFormatAnalyzer {
    excelProcessor: IExcelProcessor

    constructor(
        @inject(LOGIC_TYPES.IExcelProcessor) excelProcessor: IExcelProcessor
    ) {
        this.excelProcessor = excelProcessor
    }

    analyze(sheet: WorkSheet, column: number, startRow: number, endRow: number): string {
        // is this dangerous? assuming that if the first item is a date object - the rest are as well.
        if (this.excelProcessor.isDate(sheet, startRow, column)) return ''

        // get string array
        const dateStrs = this.excelProcessor.getRawValues<string>(sheet, startRow, endRow, column, column + 1)

        // check the first scenario - create date objects from all strings and test it.
        if (this.test(dateStrs.map((ds) => moment(ds)))) return ''

        // get delimiter
        const delimiter = this.getDelimiter(dateStrs[0])

        return this.tryFormats(dateStrs, delimiter)
    }

    private tryFormats(dateStrs: string[], delimiter: string) {
        // for each part of the date format, check what available options there are.
        const partOptions = (partStrs: string[]) => {
            // if has a length of 4 - must be the year.
            if (partStrs[0].length === 4) return ['YYYY']
            
            // below here we have 2 digits or less.

            // if has a length of 2 and numbers over 31 - must be a year.
            if (partStrs.find((p) => parseInt(p) > 31)) return ['YY']

            // if has  alength of 2 and numbers over 12 - can be day or year (not month)
            if (partStrs.find((p) => parseInt(p) > 12)) {
                // if there is a part instance that has only one digit - it can only be a day.
                // otherwise it can be a month or a year.
                if (partStrs.find((p) => p.length === 1)) return ['D']
                return ['DD', 'YY']
            }
        
            // if has a length of 2 or 1, can be either month of day.
            if (partStrs.find((p) => p.length === 1)) return ['M', 'D']

            // if always has a length of 2 - can be month, day or year.
            if (!partStrs.find((p) => p.length !== 2)) return ['MM', 'DD', 'YY']
        }

        const part1Options = partOptions(dateStrs.map((d) => d.split(delimiter)[0]))
        const part2Options = partOptions(dateStrs.map((d) => d.split(delimiter)[1]))
        const part3Options = partOptions(dateStrs.map((d) => d.split(delimiter)[2]))
        
        const found: string[] = []
        part1Options?.forEach((p1) => {
            part2Options?.forEach((p2) => {
                part3Options?.forEach((p3) => {
                    // make sure non of the 3 parts have the same 'job' in the date part.
                    // e.g we don't expect D/M/Y to appear in 2 places.
                    if (p1[0] === p2[0] || p1[0] === p3[0] || p2[0] === p3[0]) return
                    const format = `${p1}${delimiter}${p2}${delimiter}${p3}`
                    if (this.test(dateStrs.map((d) => moment(d, format)))) found.push(format)
                })
            })
        })
        if (found.length > 1) throw new Error(`Date format identification failed - found multiple options: ${found.toString()}`)
        if (found.length === 0) throw new Error('Date format identification failed - could not find matching format')
        return found[0]
    }

    private test(dates: moment.Moment[]): boolean {
        // if any of the input is not a date - fail.
        const notDate = dates.find((d) => !d.isValid())
        if (notDate) return false

        // remove elements from array as long as first item is smaller or equal to last removed item.
        let prevDate = moment(0) // start with earliest date available as a low constant
        let testDates = [...dates]
        while (testDates.length && testDates[0].isSameOrAfter(prevDate)) prevDate = testDates.shift() as moment.Moment

        // if the test was successful return now.
        if (testDates.length ===0) return true

        // in some cases the dates are monotonous in reverse order. check that.
        prevDate = moment() // latest date is now.
        testDates = [...dates]
        while (testDates.length && testDates[0].isSameOrBefore(prevDate)) prevDate = testDates.shift() as moment.Moment

        // if no dates left - it means the date list is monotonous and the test was successful.
        return testDates.length === 0
    }

    private getDelimiter(dateStr: string) {
        const sinNumbers = dateStr.replace(/[0-9]/g, '')
        if (sinNumbers.length !== 2 || sinNumbers[0] !== sinNumbers[1]) {
            throw new Error(`Cannot parse date - cannot identify delimiter: '${dateStr}'`)
        }
        return sinNumbers[0]
    }
}