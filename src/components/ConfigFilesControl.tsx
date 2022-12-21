import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PopupStateComp, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { PopupState } from 'material-ui-popup-state/core';
import API from '../api'
import { AppFiles } from "expensifier-logic/shared.types";

export function ExportFiles() {
	return (
		<PopupStateComp variant="popover" popupId="demo-popup-menu">
			{(popupState) => (
				<React.Fragment>
					<Button variant="contained" {...bindTrigger(popupState)} size="small">
						Export
					</Button>
					<Menu {...bindMenu(popupState)}>
						<MenuItem onClick={() => exportFile(AppFiles.DataColumnOptions, popupState)}>Column Options</MenuItem>
						<MenuItem onClick={() => exportFile(AppFiles.Identifiers, popupState)}>Identifiers</MenuItem>
						<MenuItem onClick={() => exportFile(AppFiles.Mappings, popupState)}>Mappings</MenuItem>
					</Menu>
				</React.Fragment>
			)}
		</PopupStateComp>
	);
}

export function ImportFiles() {
	const UploadComp = (p: {file: AppFiles, name: string, popupState: PopupState}) => {
		return <Button variant='text' component='label' size='small' sx={{textTransform: 'none'}}>{p.name}<input
			type="file"
			hidden
			onChange={async (e) => {
				const file = e.target.files?.item(0)
				if (file) {
					const fileData = await file.text()
					await API.setConfigFile({ data: JSON.parse(fileData), file: p.file })
				}
				p.popupState.close()
			}}
			accept=".json"
		/></Button>
	}

	return (
		<PopupStateComp variant="popover" popupId="demo-popup-menu">
			{(popupState) => (
				<React.Fragment>
					<Button variant="contained" {...bindTrigger(popupState)} size="small">
						Import
					</Button>
					<Menu {...bindMenu(popupState)}>
						<MenuItem><UploadComp name='Column Options' file={AppFiles.DataColumnOptions} popupState={popupState} /></MenuItem>
						<MenuItem><UploadComp name='Identifiers' file={AppFiles.Identifiers} popupState={popupState} /></MenuItem>
						<MenuItem><UploadComp name='Mappings' file={AppFiles.Mappings} popupState={popupState} /></MenuItem>
					</Menu>
				</React.Fragment>
			)}
		</PopupStateComp>
	);
}

async function exportFile(file: AppFiles, popupState: PopupState) {
	const data = await API.getConfigFile({ file });
	const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
		JSON.stringify(data, null, '\t')
	)}`;
	const link = document.createElement("a");
	link.href = jsonString;
	link.download = file;

	link.click();
	popupState.close();
}

