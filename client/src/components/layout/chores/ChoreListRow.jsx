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
import TipTapMenu from '../../TipTapMenu';
import StarterKit from '@tiptap/starter-kit';
import { useUpdateChoreMutation } from '../../../slices/choresApiSlice';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import SaveIcon from '@material-ui/icons/Save';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FrequencyCell from './FrequencyCell';

export default function Row({ chore, tags }) {
    const [updateChore, { isLoading: isUpdateChoreLoading }] = useUpdateChoreMutation();
    const [open, setOpen] = useState(false);
    const [editName, setEditName] = useState(false);
    const [editTags, setEditTags] = useState(false);
    const [name, setName] = useState(chore.name);
    const [selectedTagUuids, setSelectedTags] = useState((chore.tags && chore.tags.map(t => t.uuid)) || []);
    const selectedTags = selectedTagUuids.reduce((acc, uuid) => {
        const selectedTag = tags && tags.length && tags.find(t => t.uuid === uuid);
        if (!selectedTag) {
            return acc;
        }
        return [ ...acc, selectedTag ];
    }, []);
    const classes = useStyles();
    const wrapper = createRef();
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        editorProps: {
            attributes: {
                class: 'textEditorContainer'
            }
        },
        content: chore.description
    });

    useEffect(()=> {
        if (editor && !editor.isDestroyed) {
            editor.commands.setContent(chore.description);
        }
    }, [chore.description, editor]);

    const handleSelectedTagsChange = (event) => {
        const { value } = event.target;
        setSelectedTags(value);
    };

    const handleSelectedTagsSaveClick = () => {
        updateChore({
            selectedTags,
            uuid: chore.uuid
        });
        setEditTags(!editTags);
    };

    const handleNameSaveClick = () => {
        updateChore({
            uuid: chore.uuid,
            name
        });
        setEditName(!editName);
    };

    const handleDescriptionSaveClick = () => {
        updateChore({
            uuid: chore.uuid,
            description: editor.getHTML()
        });
    };

    if (isUpdateChoreLoading) {
        return (<>Loading...</>);
    }

    return [
        <TableRow key={0} className={classes.root}>
            <TableCell className={classes.borderRight}>
                <Switch
                    aria-label="enable switch"
                    checked={chore.enabled}
                    onChange={() => updateChore({ uuid: chore.uuid, enabled: !chore.enabled })}
                />
            </TableCell>
            <TableCell className={classes.borderRight}>
                <div className={classes.tableContents}>
                    {!editName ? (
                        <>
                            <span>{name}</span>
                            <IconButton onClick={() => setEditName(!editName)}><EditIcon /></IconButton>
                        </>
                    ) : (
                        <>
                            <TextField label="Name" id={`chore-name-input-${chore.uuid}`} onChange={evt => setName(evt.target.value)} value={name} />
                            <div>
                                <IconButton onClick={() => setEditName(!editName)}><CancelIcon /></IconButton>
                                <IconButton onClick={handleNameSaveClick}><SaveIcon /></IconButton>
                            </div>
                        </>
                    )}
                </div>
            </TableCell>
            <FrequencyCell chore={chore} />
            <TableCell className={classes.borderRight}>
                {!editTags ? (
                    <div
                        className={classes.tableContents}
                        style={!selectedTags.length ? { justifyContent: 'flex-end' } : {}}
                    >
                        <div>
                            {selectedTags.map((tag, idx) => (
                                <Chip key={idx} label={tag.name} style={{ marginRight: '0.5rem' }} variant="outlined" />
                            ))}
                        </div>
                        <IconButton onClick={() => setEditTags(!editTags)}><EditIcon /></IconButton>
                    </div>
                ) : (
                    <div className={classes.tableContents}>
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
                                            tags && tags.length && selectedTagUuids.map((tag) => {
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
                        <div>
                            <IconButton onClick={() => setEditTags(!editTags)}><CancelIcon /></IconButton>
                            <IconButton onClick={handleSelectedTagsSaveClick}><SaveIcon /></IconButton>
                        </div>
                    </div>
                )}
            </TableCell>
            <TableCell align="center">
                <IconButton aria-label="expand chore" size="small" onClick={() => setOpen(!open)}>
                    {open ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
            </TableCell>
        </TableRow>,
        <TableRow key={1} >
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box margin={0} className={classes.historyContainer}>
                        <Typography variant="h6" component="h4">
                            Directions
                            <IconButton onClick={handleDescriptionSaveClick}><SaveIcon /></IconButton>
                        </Typography>
                        <EditorContent className={classes.entryContainer} editor={editor} id={`chore-description-${chore.uuid}`} />
                        <TipTapMenu editor={editor} />
                        <Typography className={classes.h4} variant="h6" component="h4">
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
