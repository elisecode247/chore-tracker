import React, { useEffect, useState } from 'react';
import { useAddChoreMutation } from '../../../slices/choresApiSlice';
import { useGetTagsQuery } from '../../../slices/tagsApiSlice';
import makeStyles from '@material-ui/core/styles/makeStyles';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Modal from '@material-ui/core/Modal';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { defaultDescription } from '../../../constants/defaultValues';
import styles from '../../../styles';
import {
    KeyboardTimePicker,
    KeyboardDatePicker
} from '@material-ui/pickers';
import formatScheduledAt from '../../../utilities/formatScheduledAt';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapMenu from '../../TipTapMenu';

const useStyles = makeStyles((theme) => ({
    base: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        width: '66%',
        maxHeight: '99vh',
        overflowY: 'auto'
    },
    buttonContainer: {
        padding: '1rem 0 1rem 0'
    },
    descriptionInput: {
        marginTop: '2rem',
        overflowY: 'auto',
        maxHeight: '100px'
    },
    fab: {
        backgroundColor: styles.accent
    },
    formControl: {
        marginRight: '1rem',
        minWidth: 120,
    },
    inlineBlock: {
        display: 'inline-block'
    },
    inputLabel: {
        display: 'block',
        marginBottom: '3rem'
    },
    marginTop: {
        marginTop: '1rem'
    },
    tagContainer: {
        display: 'block',
        marginTop: '2rem'
    },
    tagFormGroup: {
        flexDirection: 'row'
    },
    tagsSelect: {
        display: 'block',
        margin: '1rem 0 0 0'
    }
}));

export default function AddChoreModal() {
    const { data: tags, error: errorTags, isLoading: isLoadingTags } = useGetTagsQuery();
    const [addChore, { isLoading }] = useAddChoreMutation();
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [reason, setReason] = useState('');
    const [isFrequencyChecked, toggleFrequencyChecked] = useState(true);
    const [frequencyAmount, setFrequencyAmount] = useState(1);
    const [frequencyType, setFrequencyType] = useState('day');
    const [frequencySubtype, setFrequencySubtype] = useState('day');
    const [frequencySubTypes, setFrequencySubtypes] = useState(getFrequencySubTypeOptions('day'));
    const [selectedTags, setSelectedTags] = useState([]);
    const [scheduledDate, setScheduledDate] = useState(new Date());
    const [scheduledTime, setScheduledTime] = useState(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        editorProps: {
            attributes: {
                class: 'journalContainer'
            }
        },
        content: `
            <h1>Test</h1>
            <h2>Tst2>/h2>
        `
    });

    useEffect(()=> {
        if (editor && !editor.isDestroyed) {
            editor.commands.setContent(defaultDescription);
        }
    }, [editor]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleFrequencyAmountChange = (evt) => {
        setFrequencyAmount(evt.target.value < 1 ? 1 : evt.target.value);
    };

    const handleFrequencyTypeChange = (evt) => {
        const frequencySubTypes = getFrequencySubTypeOptions(evt.target.value);
        setFrequencyType(evt.target.value);
        if(evt.target.value === 'week') {
            setFrequencySubtype([]);
        } else {
            setFrequencySubtype(frequencySubTypes.length ? frequencySubTypes[0].value : '');
        }
        setFrequencySubtypes(frequencySubTypes);
    };

    const handleSubtypeWeekChange = (event) => {
        const daysOfWeek = event.target.checked ? [...frequencySubtype, event.target.name] :
            frequencySubtype.filter(name => (event.target.name !== name));
        setFrequencySubtype(daysOfWeek);
    };

    const handleFrequencySubtypeChange = (evt) => {
        setFrequencySubtype(evt.target.value);
    };

    const handleFrequencyCheck = () => {
        toggleFrequencyChecked(!isFrequencyChecked);
    };

    const handleSelectedTagsChange = (event) => {
        const { value } = event.target;
        setSelectedTags(value);
    };

    const handleSubmit = () => {
        const hasTime = !!scheduledTime;
        const scheduledAt = formatScheduledAt(scheduledDate, scheduledTime);

        addChore({
            name,
            description,
            location,
            reason,
            scheduledAt,
            hasTime,
            isFrequencyChecked,
            frequencyAmount,
            frequencyType,
            frequencySubtype,
            selectedTags
        });

        setName('');
        setDescription('');
        setFrequencyAmount(1);
        setFrequencyType('day');
        setFrequencySubtype('day');
        setFrequencySubtypes(getFrequencySubTypeOptions('day'));
        setReason('');
        setLocation('');
        setScheduledDate(new Date());
        setScheduledTime(null);
        setSelectedTags([]);
        setOpen(false);
    };


    const body = (
        <div className={classes.base} noValidate autoComplete="off">
            <h2 id="add-chore-modal-title">Add Chore</h2>
            <form id="add-chore-modal-form">
                <TextField id="add-chore-name-input" fullWidth label="What" onChange={(evt)=>setName(evt.target.value)} required type="text" />
                {/* <TextField
                    className={classes.descriptionInput}
                    defaultValue={defaultDescription}
                    id="add-chore-description-input"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    fullWidth
                    label="How"
                    multiline
                    onChange={(evt)=>setDescription(evt.target.value)}
                    variant="filled"
                /> */}
                <EditorContent className={classes.entryContainer} editor={editor} id="add-chore-description-input" />
                <TipTapMenu editor={editor} />

                <TextField id="add-chore-location-input" fullWidth label="Location" onChange={(evt)=>setLocation(evt.target.value)}/>
                <TextField id="add-chore-reason-input" fullWidth label="Why it's important" onChange={(evt)=>setReason(evt.target.value)}/>
                <FormControl className={`${classes.formControl} ${classes.inlineBlock}`} >
                    <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="scheduled-chore-date-local"
                        label="Starting Date"
                        value={scheduledDate}
                        onChange={setScheduledDate}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                    <KeyboardTimePicker
                        margin="normal"
                        id="scheduled-chore-time-local"
                        label="Starting Time"
                        value={scheduledTime}
                        onChange={setScheduledTime}
                        KeyboardButtonProps={{
                            'aria-label': 'change time',
                        }}
                        variant="inline"
                    />
                </FormControl>
                <FormControl className={classes.formControl} fullWidth>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isFrequencyChecked}
                                onChange={handleFrequencyCheck}
                                name="checkedFrequency"
                                color="primary"
                            />
                        }
                        label="Repeat"
                    />
                </FormControl>
                {isFrequencyChecked ? (
                    <>
                        <FormControl className={classes.formControl}>
                            <TextField
                                label="Every"
                                type="number"
                                onChange={handleFrequencyAmountChange}
                                value={frequencyAmount}
                            />
                            <Select
                                labelId="frequency-type-select-label"
                                id="demo-simple-select"
                                value={frequencyType}
                                onChange={handleFrequencyTypeChange}
                            >
                                <MenuItem value='day'>days</MenuItem>
                                <MenuItem value='week'>weeks</MenuItem>
                                <MenuItem value='month'>months</MenuItem>
                                <MenuItem value='year'>years</MenuItem>
                            </Select>
                        </FormControl>
                        {frequencySubTypes.length ? (frequencyType === 'week' ? (
                            <div>
                                {frequencySubTypes.map((subtype, idx) => {
                                    return (
                                        <FormControlLabel
                                            key={idx} 
                                            control={<Checkbox name={subtype.value} />}
                                            label={subtype.label}
                                            onChange={handleSubtypeWeekChange}
                                        />
                                    );
                                })}
                            </div>
                        ) : (frequencySubTypes.length ? (
                            <FormControl className={classes.formControl}>
                                <InputLabel className={classes.InputLabel} id="frequency-subtype-select-label">On</InputLabel>
                                <Select
                                    labelId="frequency-subtype-select-label"
                                    id="frequency-subtype-select"
                                    value={frequencySubtype}
                                    onChange={handleFrequencySubtypeChange}
                                >
                                    {frequencySubTypes.map((subtype, idx) => {
                                        return (<MenuItem key={idx} value={subtype.value}>{subtype.label}</MenuItem>);
                                    })}
                                </Select>
                            </FormControl>
                        ) : null)) : null}
                    </>
                ) : null}
                {isLoadingTags ? (<div>Loading Tags...</div>) : ((tags && tags.length) || !errorTags ? (
                    <FormControl className={`${classes.formControl} ${classes.tagsSelect}`} >
                        <InputLabel id="multiple-tags">Categories</InputLabel>
                        <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            multiple
                            value={selectedTags}
                            onChange={handleSelectedTagsChange}
                            input={<Input id="select-multiple-chip" />}
                            renderValue={(selectedTagUuids) => (
                                <div className={classes.chips}>
                                    {
                                        selectedTagUuids.map((tag) => {
                                            const selectedTag = tags.find(t => t.uuid === tag);
                                            return (
                                                <Chip key={selectedTag.uuid} label={selectedTag.name} className={classes.chip} />
                                            );
                                        })
                                    }
                                </div>
                            )}
                        >
                            {tags.map((tag, index) => {
                                return (
                                    <MenuItem key={index} value={tag.uuid}>
                                        {tag.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                ) : null)}
                <Container className={classes.buttonContainer}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}> Submit </Button>
                </Container>
            </form>
        </div>
    );

    return (
        <div>
            <Fab align="left" className={classes.fab} aria-label="add" onClick={handleOpen}>
                <AddIcon />
            </Fab>
            <Modal
                className={classes.modal}
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                {isLoading ? (<div>Loading...</div>) : body}
            </Modal>
        </div>
    );
}

function getFrequencySubTypeOptions(frequencyType) {
    switch (frequencyType) {
    case 'day':
        return [
            { label: 'Multiple times per day', value: 'multiple' },
            { label: 'Once per day', value: 'once' },
        ];
    case 'week':
        return [
            { label: 'S', value: 0 },
            { label: 'M', value: 1 },
            { label: 'T', value: 2 },
            { label: 'W', value: 3 },
            { label: 'Th', value: 4 },
            { label: 'F', value: 5 },
            { label: 'S', value: 6 },
        ];
    case 'month':
        return [
            { label: 'first day of the month', value: 'first' },
            { label: 'last day of the month', value: 'last' },
            { label: 'day', value: 'day' },
        ];
    case 'year':
        return [];
    default:
        return [];
    }
}