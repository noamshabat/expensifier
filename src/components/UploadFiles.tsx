import { Button } from "@mui/material";
import { ChangeEvent, memo } from "react";
import API from "../api/";
import { useNotifyUpdate } from "../context/RefetchContext";

function _UploadFiles() {
    const { notifyUpdateRequired }  = useNotifyUpdate()
    
    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length) {
            API.addFiles({ files: event.target.files }).then(notifyUpdateRequired).catch(console.error)
        }
    };

    return <Button
        variant="contained"
        component="label"
    >
        Upload File
        <input
            type="file"
            hidden
            onChange={onFileChange}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            multiple
        />
    </Button>
}

export const UploadFiles = memo(_UploadFiles)
