import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField, { BaseTextFieldProps } from "@mui/material/TextField";
import { CategoryKeys, Transaction, UNDEFINED_CATEGORY } from "../shared.types";
import { useEffect, useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import { useFacets } from "../hooks/useFacets";
import Autocomplete from "@mui/material/Autocomplete";
import { useMappings } from "../context/MappingsContext";

export function SetCategoryDialog(p: { transaction: Transaction }) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return <div>
        <Button variant="outlined" onClick={handleClickOpen}>...</Button>
        {open && <Dialog open={open} onClose={handleClose} maxWidth="xs">
            <DialogTitle>Set Categories for {p.transaction.description}</DialogTitle>
            <DialogContent>
                <Stack direction='column' gap={3}>
                    <DialogContentText>
                        Set the categories that apply to this transaction.
                        Note that there is no inherent relationship between the categories.
                    </DialogContentText>
                    <Stack direction='column' gap={1}>
                        <CategoryDisplay id="category" transaction={p.transaction} />
                        <CategoryDisplay id="category2" transaction={p.transaction} />
                        <CategoryDisplay id="category3" transaction={p.transaction} />
                        <CategoryDisplay id="category4" transaction={p.transaction} />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>}
    </div>
}

type SetCategoryProps = {
    id: CategoryKeys,
    transaction: Transaction
}
function CategoryDisplay(p: SetCategoryProps) {
    return <Stack direction='row' gap={2} alignItems='center'
        sx={{ paddingX: 2, paddingY: 1, border: 1, borderColor: 'text.disabled', borderRadius: 2 }}>
        <Typography variant='body2' sx={{ width: 70 }}>{p.id}</Typography>
        <Divider orientation='vertical' sx={{ alignSelf: 'stretch', height: 'auto', marginRight: 1 }} />
        <Typography variant='subtitle2'>{p.transaction[p.id as keyof Transaction]}</Typography>
        <Box sx={{ marginLeft: 'auto' }}><CategorySetter {...p} /></Box>
    </Stack>
}

function CategorySetter(p: SetCategoryProps) {
    const { mappings, setMapping } = useMappings()
    const [open, setOpen] = useState(false)
    const { facets } = useFacets()
    const [rule, setRule] = useState('')
    const [helperText, setHelperText] = useState('')
    const [ruleColor, setRuleColor] = useState<BaseTextFieldProps["color"]>()
    const [saveable, setSaveable] = useState(false)
    const [category, setCategory] = useState(p.transaction[p.id])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!category || category === UNDEFINED_CATEGORY) return
        const found = mappings[p.id].find((m) => category.match(m.regex))
        if (found) setRule(found.regex)
    }, [])

    useEffect(() => {
        if (!rule) {
            setRuleColor(undefined)
            setSaveable(false)
            setHelperText('Please provide a rule that will match the category name')
            return
        }
        if (!p.transaction.description.match(rule)) {
            setHelperText('Specified rule does not match the current category')
            setRuleColor('error')
            setSaveable(false)
            return
        }
        setHelperText('Valid rule')
        setRuleColor('success')
        setSaveable(true)
    }, [rule])

    const setNewMapping = async () => {
        setLoading(true)
        await setMapping(category, rule, p.id)
        setLoading(false)
        setOpen(false)
    }

    return <>
        <EditIcon onClick={() => setOpen(true)} sx={{ cursor: 'pointer' }} />
        {open &&
            <Dialog open={true}>
                <DialogTitle>Set {p.id} for {p.transaction.description}</DialogTitle>
                <DialogContent>
                    <Stack direction='column' spacing={1}>
                        <DialogContentText>Select the category from the list or create a new one.</DialogContentText>
                        <Autocomplete
                            id={p.id}
                            freeSolo
                            options={facets[p.id]}
                            value={category}
                            onChange={(_e, value) => setCategory(value || '')}
                            renderInput={(params) => <TextField {...params} onChange={(e) => setCategory(e.target.value)} label={p.id} />}
                        />
                    </Stack>
                    <Stack direction='column' spacing={1} marginTop={3}>
                        <DialogContentText>Set a rule using regex that can apply to multiple records</DialogContentText>
                        <TextField 
                            label='rule'
                            value={rule}
                            onChange={(e) => setRule(e.target.value)}
                            color={ruleColor}
                            helperText={helperText}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <LoadingButton loading={loading} disabled={!saveable} onClick={setNewMapping}>Set</LoadingButton>
                </DialogActions>
            </Dialog>
        }
    </>
}