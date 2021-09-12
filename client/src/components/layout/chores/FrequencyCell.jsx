import { useState } from 'react';
import { choresListRowStyles as useStyles } from './styles.js';
import { useUpdateChoreMutation } from '../../../slices/choresApiSlice';
import formatScheduledAt from '../../../utilities/formatScheduledAt';
import { getFrequencySubTypeOptions, formatFrequency } from '../../frequency/utilities';
import CancelIcon from '@material-ui/icons/Cancel';
import Checkbox from '@material-ui/core/Checkbox';
import EditIcon from '@material-ui/icons/Edit';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import { KeyboardTimePicker, KeyboardDatePicker } from '@material-ui/pickers';
import MenuItem from '@material-ui/core/MenuItem';
import SaveIcon from '@material-ui/icons/Save';
import Select from '@material-ui/core/Select';
import TableCell from '@material-ui/core/TableCell';
import TextField from '@material-ui/core/TextField';

export default function FrequencyCell({ chore }) {
    const [updateChore, { isLoading: isUpdateChoreLoading }] = useUpdateChoreMutation();
    const classes = useStyles();
    const [editFrequency, setEditFrequency] = useState(false);
    const [scheduledDate, setScheduledDate] = useState(new Date(chore.scheduledAt) || new Date());
    const [scheduledTime, setScheduledTime] = useState(chore.hasTime ? new Date(chore.scheduledAt) : null);
    const [isFrequencyChecked, toggleFrequencyChecked] = useState(chore.parsedFrequency?.repeatType !== 'once' || false);
    const [frequencyAmount, setFrequencyAmount] = useState(chore.parsedFrequency?.repeatAmount || 1);
    const [frequencyType, setFrequencyType] = useState(chore.parsedFrequency?.repeatType || 'day');
    const [frequencySubtype, setFrequencySubtype] = useState(chore.parsedFrequency?.repeatSubtype || '');
    const [frequencySubTypes, setFrequencySubtypes] = useState(getFrequencySubTypeOptions(chore.parsedFrequency?.repeatType));
    const formattedFrequency = formatFrequency({ hasTime: chore.has_time, scheduledAt: new Date(chore.scheduledAt), frequencyAmount, frequencyType, frequencySubtype });

    const handleFrequencyAmountChange = (evt) => {
        setFrequencyAmount(evt.target.value < 1 ? 1 : evt.target.value);
    };

    const handleFrequencyTypeChange = (evt) => {
        const frequencySubTypes = getFrequencySubTypeOptions(evt.target.value);
        setFrequencyType(evt.target.value);
        if (evt.target.value === 'week') {
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

    const handleFrequencySaveClick = () => {
        const hasTime = !!scheduledTime;
        const scheduledAt = formatScheduledAt(scheduledDate, scheduledTime);

        updateChore({
            uuid: chore.uuid,
            scheduledAt,
            hasTime,
            isFrequencyChecked,
            frequencyAmount,
            frequencyType,
            frequencySubtype,
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
                    {formattedFrequency}
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
                        value={scheduledDate}
                        onChange={setScheduledDate}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </FormControl>
                <FormControl className={classes.formControl}>
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
                <FormControlLabel
                    style={{ display: 'block' }}
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
                {isFrequencyChecked ? (
                    <div className={classes.tableContents} style={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}>
                        <FormControl className={classes.formControl}>
                            <TextField
                                label="Every"
                                type="number"
                                onChange={handleFrequencyAmountChange}
                                style={{ width: '60px' }}
                                value={frequencyAmount}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl}>
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
                            </>) : null)) : null}
                    </div>
                ) : null}
            </div>
            <div style={{ display: 'flex' }}>
                <IconButton onClick={()=>setEditFrequency(!editFrequency)}><CancelIcon /></IconButton>
                <IconButton onClick={handleFrequencySaveClick}><SaveIcon /></IconButton>
            </div>
        </TableCell>
    );
}
