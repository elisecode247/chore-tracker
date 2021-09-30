import React, { useState } from 'react';
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
import ButtonGroup from '@material-ui/core/ButtonGroup';
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
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import TextEditor from '../../TextEditor';

export default function AddChorePanel() {
    const { data: tags, error: errorTags, isLoading: isLoadingTags } = useGetTagsQuery();
    const { settings } = useSelector(userSelector);
    const [addChore, { isLoading, isError, isSuccess }] = useAddChoreMutation();
    const classes = useStyles();
    const [name, setName] = useState('');
    const [isRepeatChecked, toggleRepeatChecked] = useState(true);
    const [repeatAmount, setRepeatAmount] = useState(1);
    const [repeatType, setRepeatType] = useState('DAILY');
    const [selectedTags, setSelectedTags] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(null);
    const [endDate, setEndDate] = useState(new Date());
    const [endTime, setEndTime] = useState(null);
    const [selectedWeekdays, setSelectedWeekdays] = useState([]);
    const [description, setDescription] = useState(settings?.choreSettings?.choreTemplate || defaultDescription);

    const handleRepeatAmountChange = (evt) => {
        setRepeatAmount(evt.target.value);
    };

    const handleFrequencyTypeChange = (evt) => {
        setRepeatType(evt.target.value);
    };


    const handleRepeatCheck = () => {
        toggleRepeatChecked(!isRepeatChecked);
    };

    const handleSelectedTagsChange = (event) => {
        const { value } = event.target;
        setSelectedTags(value);
    };

    const handleWeekdayChange = function (evt) {
        const selectedWeekday = evt.target.name;
        if (selectedWeekdays.includes(selectedWeekday)) {
            setSelectedWeekdays(selectedWeekdays.filter(day => day !== selectedWeekday));
        } else {
            setSelectedWeekdays([...selectedWeekdays, selectedWeekday]);
        }
    };

    const handleSubmit = () => {
        // TODO validation
        // repeatAmount must be 1 > 0
        // If repeat hourly, start date and time must be same date and endAt is NOT optional
        const startAt = formatScheduledAt(startDate, startTime);
        const endAt = formatScheduledAt(endDate, endTime);
        addChore({
            name,
            description,
            startAt,
            ...(!isRepeatChecked ? { endAt } : {}),
            hasTime: startTime ? true : false,
            frequency: isRepeatChecked ? formatFrequencyForServer({
                repeatAmount,
                repeatType,
                selectedWeekdays
            }) : '',
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
                <TextField
                    className={classes.nameInput}
                    fullWidth label="What"
                    onChange={(evt) => setName(evt.target.value)}
                    required
                    type="text"
                />
                <TextEditor
                    content={description}
                    setContent={setDescription}
                />
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
                                <MenuItem value='HOURLY'>Hourly</MenuItem>
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
                        {repeatType === 'WEEKLY' ?
                            (
                                <FormGroup className={classes.weekdaysContainer}>
                                    <FormControlLabel control={<Checkbox checked={selectedWeekdays.includes('SU')} onChange={handleWeekdayChange} name="SU" />} label="Sun" labelPlacement="top" />
                                    <FormControlLabel control={<Checkbox checked={selectedWeekdays.includes('MO')} onChange={handleWeekdayChange} name="MO" />} label="Mon" labelPlacement="top" />
                                    <FormControlLabel control={<Checkbox checked={selectedWeekdays.includes('TU')} onChange={handleWeekdayChange} name="TU" />} label="Tue" labelPlacement="top" />
                                    <FormControlLabel control={<Checkbox checked={selectedWeekdays.includes('WE')} onChange={handleWeekdayChange} name="WE" />} label="Wed" labelPlacement="top" />
                                    <FormControlLabel control={<Checkbox checked={selectedWeekdays.includes('TH')} onChange={handleWeekdayChange} name="TH" />} label="Thu" labelPlacement="top" />
                                    <FormControlLabel control={<Checkbox checked={selectedWeekdays.includes('FR')} onChange={handleWeekdayChange} name="FR" />} label="Fri" labelPlacement="top" />
                                    <FormControlLabel control={<Checkbox checked={selectedWeekdays.includes('SA')} onChange={handleWeekdayChange} name="SA" />} label="Sat" labelPlacement="top" />
                                </FormGroup>
                            ) : null
                        }
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
                <ButtonGroup>
                    <Button variant="contained" color="primary" onClick={handleSubmit}> Submit </Button>
                    {isError ?
                        (
                            <div>An unknown error occurred.</div>
                        ) : null
                    }
                    {isSuccess ?
                        (
                            <div>Chore Added</div>
                        ) : null
                    }
                </ButtonGroup>
            </form>
        </div>
    );
}
