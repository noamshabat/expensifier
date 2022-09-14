import { Button } from "@mui/material";
import { ChangeEvent, memo } from "react";
import { addFiles } from "../api";
import { useNotifyUpdate } from "../context/RefetchContext";

function _UploadFiles() {
    const { notifyUpdateRequired }  = useNotifyUpdate()
    
    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length) {
            addFiles(event.target.files).then(notifyUpdateRequired)
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
