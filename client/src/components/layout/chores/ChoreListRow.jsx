import React, { createRef, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import format from 'date-fns/format';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import EditIcon from '@material-ui/icons/Edit';
import Chip from '@material-ui/core/Chip';
import { choresListRowStyles as useStyles } from './styles.js';
import { DATE_FORMAT } from '../../../constants/dateTimeFormats';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function Row({ chore }) {
    const [open, setOpen] = useState(false);
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

    return (
        <>
            <TableRow className={classes.root}>
                <TableCell>
                    <IconButton aria-label="expand chore" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <FiberManualRecordIcon className={chore.enabled ? classes.enabled : classes.disabled} />
                </TableCell>
                <TableCell>{chore.name}</TableCell>
                <TableCell>{chore.formattedFrequency}</TableCell>
                <TableCell>{chore.tags ? chore.tags.map((tag, idx) => (<Chip key={idx} label={tag.name} variant="outlined" />)) : ''}</TableCell>
                <TableCell align="right">
                    <Button className={classes.editButton} onClick={()=> alert('Under Construction')} ><EditIcon /></Button>
                </TableCell>

            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={0} className={classes.historyContainer}>
                            <Typography variant="h6" gutterBottom component="span">
                                Directions
                            </Typography>
                            {!chore.description ?<p>--</p> : (
                                <EditorContent className={classes.entryContainer} editor={editor} id={`chore-description-${chore.uuid}`} />
                            )}
                            <Typography variant="h6" gutterBottom component="span">
                                Why it's Important
                            </Typography>
                            {!chore.reason ?<p>--</p> : (
                                <p>{chore.reason}</p>
                            )}
                            <Typography variant="h6" gutterBottom component="span">
                                Scheduled Start
                            </Typography>
                            {!chore.scheduled_at ?<p>--</p> : (
                                <p>
                                    <span>{format(new Date(chore.scheduled_at), DATE_FORMAT)}</span>
                                    {/** TODO */}
                                </p>
                            )}
                            <Typography variant="h6" gutterBottom component="span">
                                Location
                            </Typography>
                            {!chore.location ?<p>--</p> : (
                                <p>{chore.location}</p>
                            )}
                            <Typography variant="h6" gutterBottom component="span">
                                Most Recent History
                            </Typography>
                            {!chore.history ?<div>No History</div> : (
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
        </>
    );
}
