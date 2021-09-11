import React, { createRef, useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import format from 'date-fns/format';
import EditIcon from '@material-ui/icons/Edit';
import Chip from '@material-ui/core/Chip';
import { choresListRowStyles as useStyles } from './styles.js';
import { DATE_FORMAT } from '../../../constants/dateTimeFormats';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useUpdateChoreMutation } from '../../../slices/choresApiSlice';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import SaveIcon from '@material-ui/icons/Save';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import formatScheduledAt from '../../../utilities/formatScheduledAt';
import { getFrequencySubTypeOptions, formatFrequency } from '../../frequency/utilities';
import {
    KeyboardTimePicker,
    KeyboardDatePicker
} from '@material-ui/pickers';

export default function Row({ chore, tags }) {
    const [updateChore, { isLoading: isUpdateChoreLoading }] = useUpdateChoreMutation();
    const [open, setOpen] = useState(false);
    const [editTopRow, setEditTopRow] = useState(false);
    const [name, setName] = useState(chore.name);
    // const [location, setLocation] = useState('');
    // const [reason, setReason] = useState('');
    const [scheduledDate, setScheduledDate] = useState(new Date(chore.scheduledAt) || new Date());
    const [scheduledTime, setScheduledTime] = useState(chore.hasTime ? new Date(chore.scheduledAt) : null);
    const [isFrequencyChecked, toggleFrequencyChecked] = useState(chore.parsedFrequency?.repeatType !== 'once' || false);
    const [frequencyAmount, setFrequencyAmount] = useState(chore.parsedFrequency?.repeatAmount || 1);
    const [frequencyType, setFrequencyType] = useState(chore.parsedFrequency?.repeatType || 'day');
    const [frequencySubtype, setFrequencySubtype] = useState(chore.parsedFrequency?.repeatSubtype || '');
    const [frequencySubTypes, setFrequencySubtypes] = useState(getFrequencySubTypeOptions(chore.parsedFrequency?.repeatType));
    const [selectedTagUuids, setSelectedTags] = useState(chore.tags.map(t => t.uuid) || []);
    const selectedTags = selectedTagUuids.reduce((acc, uuid) => {
        const selectedTag = tags.find(t => t.uuid === uuid);
        if (!selectedTag) {
            return acc;
        }
        return [ ...acc, selectedTag ];
    }, []);
    const formattedFrequency = formatFrequency({ hasTime: chore.has_time, scheduledAt: new Date(chore.scheduledAt), frequencyAmount, frequencyType, frequencySubtype });
    const classes = useStyles();
    const wrapper = createRef();
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        editorProps: {
            attributes: {
                class: 'journalContainer'
            }
        },
        content: chore.description
    });

    useEffect(()=> {
        if (editor && !editor.isDestroyed) {
            editor.commands.setContent(chore.description);
        }
    }, [chore.description, editor]);

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

    const handleTopRowSubmit = () => {
        const hasTime = !!scheduledTime;
        const scheduledAt = formatScheduledAt(scheduledDate, scheduledTime);

        updateChore({
            name,
            scheduledAt,
            hasTime,
            isFrequencyChecked,
            frequencyAmount,
            frequencyType,
            frequencySubtype,
            selectedTags,
            uuid: chore.uuid
        });
    };

    if (isUpdateChoreLoading) {
        return (<>Loading...</>);
    }
    return [
        <TableRow key={0} className={classes.root}>
            <TableCell>
                <Switch
                    aria-label="enable switch"
                    checked={chore.enabled}
                    onChange={() => updateChore({ uuid: chore.uuid, enabled: !chore.enabled })}
                />
            </TableCell>
            <TableCell>
                {!editTopRow ? name : (
                    <TextField label="Name" id={`chore-name-input-${chore.uuid}`} onChange={evt => setName(evt.target.value)} value={name} />
                )}
            </TableCell>
            <TableCell>
                {!editTopRow ? formattedFrequency : (
                    <>
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
                        </FormControl>
                        <FormControl className={`${classes.formControl} ${classes.inlineBlock}`} >
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
                        <FormControl className={classes.formControl}>
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
                                    </>
                                ) : null)) : null}
                            </>
                        ) : null}
                    </>
                )}
            </TableCell>
            <TableCell>
                {!editTopRow ? selectedTags.map((tag, idx) => (<Chip key={idx} label={tag.name} variant="outlined" />)) : (
                    <FormControl>
                        <InputLabel id="multiple-tags">Categories</InputLabel>
                        <Select
                            className={classes.tagSelect}
                            labelId="multiple-tags"
                            id={`multiple-tags-select-${chore.uuid}`}
                            multiple
                            value={selectedTagUuids}
                            onChange={handleSelectedTagsChange}
                            input={<Input id="select-tag-input" />}
                            renderValue={(selectedTagUuids) => (
                                <div className={classes.chips}>
                                    {
                                        selectedTagUuids.map((tag) => {
                                            const selectedTag = tags.find(t => t.uuid === tag);
                                            if (!selectedTag) {
                                                return <></>;
                                            }
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
                )}
            </TableCell>
            <TableCell align="right">
                <IconButton aria-label="expand chore" size="small" onClick={() => setOpen(!open)}>
                    {open ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
                {!editTopRow ? (
                    <IconButton aria-label="expand chore" size="small" onClick={() => setEditTopRow(!editTopRow)}>
                        <EditIcon />
                    </IconButton>
                ) : (
                    <>
                        <IconButton onClick={() => setEditTopRow(!editTopRow)}><CancelIcon /></IconButton>
                        <IconButton onClick={handleTopRowSubmit}><SaveIcon /></IconButton>
                    </>
                )}
            </TableCell>
        </TableRow>,
        <TableRow key={1} >
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box margin={0} className={classes.historyContainer}>
                        <Typography variant="h6" gutterBottom component="span">
                            Directions
                        </Typography>
                        {!chore.description ? <p>--</p> : (
                            <EditorContent className={classes.entryContainer} editor={editor} id={`chore-description-${chore.uuid}`} />
                        )}
                        <Typography variant="h6" gutterBottom component="span">
                            Why it's Important
                        </Typography>
                        {!chore.reason ? <p>--</p> : (
                            <p>{chore.reason}</p>
                        )}
                        <Typography variant="h6" gutterBottom component="span">
                            Scheduled Start
                        </Typography>
                        {!chore.scheduled_at ? <p>--</p> : (
                            <p>
                                <span>{format(new Date(chore.scheduled_at), DATE_FORMAT)}</span>
                                {/** TODO */}
                            </p>
                        )}
                        <Typography variant="h6" gutterBottom component="span">
                            Location
                        </Typography>
                        {!chore.location ? <p>--</p> : (
                            <p>{chore.location}</p>
                        )}
                        <Typography variant="h6" gutterBottom component="span">
                            Most Recent History
                        </Typography>
                        {!chore.history ? <div>No History</div> : (
                            <Table size="small" aria-label="completed dates">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Completed Time</TableCell>
                                        <TableCell>Notes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {chore.history.map((historyRow, index) => (
                                        <TableRow key={index} ref={wrapper}>
                                            <TableCell component="th" scope="chore">
                                                {format(new Date(historyRow.completed_at), DATE_FORMAT)}
                                            </TableCell>
                                            <TableCell component="th" scope="chore">
                                                {historyRow.notes}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>)}
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    ];
}
