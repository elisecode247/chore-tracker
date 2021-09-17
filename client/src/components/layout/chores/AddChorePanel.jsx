import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userSelector } from '../../../slices/userApiSlice';
import { useAddChoreMutation } from '../../../slices/choresApiSlice';
import { useGetTagsQuery } from '../../../slices/tagsApiSlice';
import { addChorePanelStyles as useStyles } from './styles';
import { formatFrequencyForServer, repeatTypeNoun } from '../../../utilities/chores';
import { defaultDescription } from '../../../constants/defaultValues';
import formatScheduledAt from '../../../utilities/formatScheduledAt';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import { KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import Typography from '@material-ui/core/Typography';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapMenu from '../../TipTapMenu';

export default function AddChorePanel() {
    const { data: tags, error: errorTags, isLoading: isLoadingTags } = useGetTagsQuery();
    const { settings } = useSelector(userSelector);
    const [addChore, { isLoading, isError, isSuccess }] = useAddChoreMutation();
    const classes = useStyles();
    const [name, setName] = useState('');
    const [isRepeatChecked, toggleRepeatChecked] = useState(true);
    const [repeatAmount, setRepeatAmount] = useState(1);
    const [repeatType, setFrequencyType] = useState('DAILY');
    const [selectedTags, setSelectedTags] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(null);
    const [endDate, setEndDate] = useState(new Date());
    const [endTime, setEndTime] = useState(null);
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        editorProps: {
            attributes: {
                class: 'textEditorContainer'
            }
        },
        content: defaultDescription
    });

    useEffect(()=> {
        if (editor && !editor.isDestroyed) {
            editor.commands.setContent(settings?.choreSettings?.choreTemplate || defaultDescription);
        }
    }, [settings, editor]);

    const handleRepeatAmountChange = (evt) => {
        setRepeatAmount(evt.target.value < 1 ? 1 : evt.target.value);
    };

    const handleFrequencyTypeChange = (evt) => {
        // const frequencySubTypes = getFrequencySubTypeOptions(evt.target.value);
        setFrequencyType(evt.target.value);
        // if(evt.target.value === 'week') {
        //     setFrequencySubtype([]);
        // } else {
        //     setFrequencySubtype(frequencySubTypes.length ? frequencySubTypes[0].value : '');
        // }
        // setFrequencySubtypes(frequencySubTypes);
    };

    // const handleSubtypeWeekChange = (event) => {
    //     const daysOfWeek = event.target.checked ? [...frequencySubtype, event.target.name] :
    //         frequencySubtype.filter(name => (event.target.name !== name));
    //     setFrequencySubtype(daysOfWeek);
    // };

    // const handleFrequencySubtypeChange = (evt) => {
    //     setFrequencySubtype(evt.target.value);
    // };

    const handleRepeatCheck = () => {
        toggleRepeatChecked(!isRepeatChecked);
    };

    const handleSelectedTagsChange = (event) => {
        const { value } = event.target;
        setSelectedTags(value);
    };

    const handleSubmit = () => {
        const startAt = formatScheduledAt(startDate, startTime);
        const endAt = formatScheduledAt(endDate, endTime);
        addChore({
            name,
            description: editor.getHTML(),
            startAt,
            ...(!isRepeatChecked ? { endAt } : {}),
            frequency: formatFrequencyForServer({ repeatAmount, repeatType }),
            selectedTags
        });
    };

    if (isLoading) {
        return <>Loading...</>;
    }

    return (
        <div className={classes.base} noValidate autoComplete="off">
            <Typography variant="h5" component="h2">
                Add New Chore
            </Typography>
            <form id="add-chore-form">
                <TextField id="add-chore-name-input" fullWidth label="What" onChange={(evt)=>setName(evt.target.value)} required type="text" />
                <EditorContent className={classes.entryContainer} editor={editor} id="add-chore-description-input" />
                <TipTapMenu editor={editor} />
                <div>
                    <FormControl className={`${classes.formControl} ${classes.inlineBlock}`} >
                        <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            format="MM/dd/yyyy"
                            margin="normal"
                            id="start-chore-date-local"
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                            KeyboardButtonProps={{
                                'aria-label': 'change start date',
                            }}
                        />
                    </FormControl>
                    <FormControl className={`${classes.formControl} ${classes.inlineBlock}`} >
                        <KeyboardTimePicker
                            margin="normal"
                            id="start-chore-time-local"
                            label="Start Time (Optional)"
                            value={startTime}
                            onChange={setStartTime}
                            KeyboardButtonProps={{
                                'aria-label': 'change start time',
                            }}
                            variant="inline"
                        />
                    </FormControl>
                </div>
                {!isRepeatChecked ? (
                    <div>
                        <FormControl className={`${classes.formControl} ${classes.inlineBlock}`} >
                            <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="MM/dd/yyyy"
                                margin="normal"
                                id="end-chore-date-local"
                                label="End Date (Optional)"
                                value={endDate}
                                onChange={setEndDate}
                                KeyboardButtonProps={{
                                    'aria-label': 'change end date',
                                }}
                            />
                        </FormControl>
                        <FormControl className={`${classes.formControl} ${classes.inlineBlock}`} >
                            <KeyboardTimePicker
                                margin="normal"
                                id="end-chore-time-local"
                                label="End Time (Optional)"
                                value={endTime}
                                onChange={setEndTime}
                                KeyboardButtonProps={{
                                    'aria-label': 'change end time',
                                }}
                                variant="inline"
                            />
                        </FormControl>
                    </div>
                ) : null}
                <FormControlLabel
                    className={classes.switchFormControl}
                    control={<Switch checked={isRepeatChecked} onChange={handleRepeatCheck} aria-label="repeat switch" />}
                    label="Repeat"
                    labelPlacement="start"
                />
                {isRepeatChecked ? (
                    <div>
                        <FormControl className={classes.formControl} >
                            <Select
                                label="Repeat"
                                id="repeat-type-select"
                                value={repeatType}
                                onChange={handleFrequencyTypeChange}
                            >
                                <MenuItem value='DAILY'>Daily</MenuItem>
                                <MenuItem value='WEEKLY'>Weekly</MenuItem>
                                <MenuItem value='MONTHLY'>Monthly</MenuItem>
                                <MenuItem value='YEARLY'>Yearly</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl className={classes.formControl} >
                            <TextField
                                label="Repeat Every"
                                type="number"
                                onChange={handleRepeatAmountChange}
                                value={repeatAmount}
                            />
                            <p>{repeatTypeNoun[repeatType]}(s)</p>
                        </FormControl>
                        {/* {frequencySubTypes.length ? (repeatType === 'week' ? (
                            <>
                                <div className={classes.and}> and </div>
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
                            </>
                        ) : (frequencySubTypes.length ? (
                            <>
                                <span className={classes.and}> and </span>
                                <InputLabel className={classes.tagLabel} id="frequency-subtype-select-label">On</InputLabel>
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
                            </>
                        ) : null)) : null} */}
                    </div>
                ) : null}
                {isLoadingTags ? (<div>Loading Tags...</div>) : ((tags && tags.length) || !errorTags ? (
                    <FormControl className={classes.tagSelectFormControl}>
                        <InputLabel id="multiple-tags">Categories</InputLabel>
                        <Select
                            className={classes.tagSelect}
                            labelId="multiple-tags"
                            id="multiple-tags-select"
                            multiple
                            value={selectedTags}
                            onChange={handleSelectedTagsChange}
                            input={<Input id="select-tag-input" />}
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
                    {isError ? (
                        <div>An unknown error occurred.</div>
                    ): null}
                    {isSuccess ? (
                        <div>Chore Added</div>
                    ): null}
                </Container>
            </form>
        </div>
    );
}
