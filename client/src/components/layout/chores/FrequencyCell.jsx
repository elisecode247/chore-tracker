import { useState } from 'react';
import { choresListRowStyles as useStyles } from './styles.js';
import { useUpdateChoreMutation } from '../../../slices/choresApiSlice';
import formatScheduledAt from '../../../utilities/formatScheduledAt';
import {
    formatFrequencyForDisplay,
    formatFrequencyForServer,
    parseRfc2445FrequencyString,
    repeatTypeNoun
} from '../../../utilities/chores';
import CancelIcon from '@material-ui/icons/Cancel';
import Checkbox from '@material-ui/core/Checkbox';
import EditIcon from '@material-ui/icons/Edit';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import { KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import MenuItem from '@material-ui/core/MenuItem';
import SaveIcon from '@material-ui/icons/Save';
import Select from '@material-ui/core/Select';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';

export default function FrequencyCell({ chore }) {
    const classes = useStyles();
    const frequency = chore.frequency;
    const parsedFrequency = parseRfc2445FrequencyString(frequency);
    const [editFrequency, setEditFrequency] = useState(false);
    const [startDate, setStartDate] = useState(new Date(chore.start_at) || new Date());
    const [startTime, setStartTime] = useState(chore.has_time ? new Date(chore.start_at) : null);
    const [endDate, setEndDate] = useState(chore.end_at ? new Date(chore.end_at) : null);
    const [endTime, setEndTime] = useState(chore.has_time && chore.end_at ? new Date(chore.end_at) : null);
    const [isRepeatChecked, toggleRepeatChecked] = useState(chore.end_at);
    const [repeatAmount, setRepeatAmount] = useState(parsedFrequency.INTERVAL || 1);
    const [repeatType, setRepeatType] = useState(parsedFrequency.FREQ || 'DAILY');
    const [updateChore, { isLoading: isUpdateChoreLoading }] = useUpdateChoreMutation();

    const handleRepeatAmountChange = (evt) => {
        setRepeatAmount(evt.target.value < 1 ? 1 : evt.target.value);
    };

    const handleRepeatTypeChange = (evt) => {
        setRepeatType(evt.target.value);
    };

    const handleFrequencyCheck = () => {
        toggleRepeatChecked(!isRepeatChecked);
    };

    const handleFrequencySaveClick = () => {
        const startAt = formatScheduledAt(startDate, startTime);
        const endAt = endDate && formatScheduledAt(endDate, endTime);

        updateChore({
            uuid: chore.uuid,
            startAt,
            ...(!isRepeatChecked ? { endAt } : {}),
            hasTime: !!startTime,
            frequency: formatFrequencyForServer({ repeatAmount, repeatType })
        });
        
        console.log('%c 🍤: ', 'font-size:20px;background-color: #B03734;color:#fff;', {
            uuid: chore.uuid,
            startAt,
            ...(!isRepeatChecked ? { endAt } : {}),
            hasTime: !!startTime,
            frequency: formatFrequencyForServer({ repeatAmount, repeatType })
        });
        setEditFrequency(!editFrequency);
    };

    if (isUpdateChoreLoading){
        return (<>Loading...</>);
    }

    if(!editFrequency) {
        return (
            <TableCell className={classes.borderRight}>
                <div className={classes.tableContents}>
                    {formatFrequencyForDisplay(frequency)}
                    <IconButton onClick={()=>setEditFrequency(!editFrequency)}><EditIcon /></IconButton>
                </div>
            </TableCell>
        );
    }

    return (
        <TableCell className={classes.tableCell}>
            <div>
                <FormControl className={classes.formControl}>
                    <KeyboardDatePicker
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="scheduled-chore-date-local"
                        label="Starting Date"
                        value={startDate}
                        onChange={setStartDate}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </FormControl>
                <FormControl className={classes.formControl}>
                    <KeyboardTimePicker
                        margin="normal"
                        id="scheduled-chore-time-local"
                        label="Starting Time (Optional)"
                        value={startTime}
                        onChange={setStartTime}
                        KeyboardButtonProps={{
                            'aria-label': 'change time',
                        }}
                        variant="inline"
                    />
                </FormControl>
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
                    style={{ display: 'block' }}
                    control={
                        <Checkbox
                            checked={isRepeatChecked}
                            onChange={handleFrequencyCheck}
                            name="checkedFrequency"
                            color="primary"
                        />
                    }
                    label="Repeat"
                />
                {isRepeatChecked ? (
                    <>
                        <div>
                            <FormControl className={classes.formControl}>
                                <Select
                                    label="Repeat"
                                    id="repeat-type-select"
                                    value={repeatType}
                                    onChange={handleRepeatTypeChange}
                                >
                                    <MenuItem value='DAILY'>Daily</MenuItem>
                                    <MenuItem value='WEEKLY'>Weekly</MenuItem>
                                    <MenuItem value='MONTHLY'>Monthly</MenuItem>
                                    <MenuItem value='YEARLY'>Yearly</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div>
                            <FormControl className={classes.formControl} >
                                <TextField
                                    label="Repeat Every"
                                    type="number"
                                    min="1"
                                    onChange={handleRepeatAmountChange}
                                    value={repeatAmount}
                                />
                                <p>{repeatTypeNoun[repeatType]}(s)</p>
                            </FormControl>
                        </div>
                    </>
                ) : null}
            </div>
            <div style={{ display: 'flex' }}>
                <IconButton onClick={()=>setEditFrequency(!editFrequency)}><CancelIcon /></IconButton>
                <IconButton onClick={handleFrequencySaveClick}><SaveIcon /></IconButton>
            </div>
        </TableCell>
    );
}
