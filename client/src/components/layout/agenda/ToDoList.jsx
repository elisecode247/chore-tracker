import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import { useGetChoresQuery } from '../../../slices/choresApiSlice';
import { useGetTodayEventsQuery, useDeleteEventMutation } from '../../../slices/eventsApiSlice';
import { formatChores, formatEvents } from '../../../utilities/chores';
import { stableSort } from './utilities';
import ToDoListHead from './ToDoListHead';
import ToDoListItem from './ToDoListItem';
import { toDoListStyles as useStyles } from './styles';
import { columns } from './utilities';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ToDoListTagFilterHead from './ToDoListTagFilterHead';
import ToDoListFilterHead from './ToDoListFilterHead';
import ToDoListSkippedFilterHead from './ToDoListSkippedFilterHead';
import ToDoListSortHead from './ToDoListSortHead';
import { useSelector } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import isToday from 'date-fns/isToday';

export default function ToDoList() {
    const desktop = useMediaQuery('(min-width:650px)');
    const headCells = columns.filter(column => {
        if (!desktop) return column.forMobile;
        return true;
    });
    const classes = useStyles();
    const [view, setView] = useState(localStorage.getItem('agendaView') === 'true');
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('name');
    const { data: chores, error: choresError, isLoading: isChoresLoading } = useGetChoresQuery();
    const { data: events, error: eventsError, isLoading: isEventsLoading } = useGetTodayEventsQuery();
    const [deleteEvent, { isEventDeleteLoading }] = useDeleteEventMutation();
    const [deleteEventModalUuid, setDeleteEventModalUuid] = useState('');
    const filters = useSelector((state) => state.agenda.filters);
    const sorts = useSelector((state) => state.agenda.sorts);
    const todaySkippedChores =useSelector((state) => state.agenda.todaySkippedChores);
    const [rows, setRows] = useState([]);
    const [selectedTags, setSelectedTags] = useState((localStorage.getItem('agendaSelectedTags') && JSON.parse(localStorage.getItem('agendaSelectedTags'))) || []);

    useEffect(() => {
        setRows(calculateRows({ chores, events, filters, selectedTags, sorts, todaySkippedChores }));
    }, [chores, events, selectedTags, sorts, filters, todaySkippedChores]);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleViewChange = function () {
        setView(!view);
        localStorage.setItem('agendaView', !view);
    };

    const handleDeleteEvent = () => {
        deleteEvent({ uuid: deleteEventModalUuid });
        setDeleteEventModalUuid('');

    };

    if (choresError || eventsError) {
        return (<div>Error</div>);
    }

    if (isChoresLoading || isEventsLoading) {
        return (<div>Loading...</div>);
    }

    return (
        <Card className={classes.root} elevation={3}>
            {!view ? (
                <CardContent>
                    <Typography variant="h5" component="h2">
                            Today's Items
                        <IconButton onClick={handleViewChange}><VisibilityOffIcon /></IconButton>
                    </Typography>
                </CardContent>
            ) : (
                <CardContent>
                    <Typography variant="h5" component="h2">
                        Today's Items
                        <IconButton onClick={handleViewChange}><VisibilityIcon /></IconButton>
                    </Typography>
                    <ToDoListTagFilterHead selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
                    <ToDoListFilterHead headCells={headCells} />
                    <ToDoListSkippedFilterHead chores={chores} todaySkippedChores={todaySkippedChores} />
                    <ToDoListSortHead headCells={headCells} />
                    <TableContainer>
                        <Table
                            className={classes.table}
                            aria-labelledby="tableTitle"
                            size={'medium'}
                            aria-label="enhanced table"
                        >
                            <ToDoListHead
                                headCells={headCells}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                rowCount={rows.length}
                            />
                            <TableBody>
                                {rows.map((row, key) => {
                                    const labelId = `enhanced-table-checkbox-${key}`;
                                    return (
                                        <ToDoListItem
                                            isEventDeleteLoading={isEventDeleteLoading}
                                            setDeleteEventModalUuid={setDeleteEventModalUuid}
                                            headCells={headCells}
                                            key={key}
                                            labelId={labelId}
                                            row={row}
                                        />
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            )}
            {deleteEventModalUuid ? (
                <Dialog
                    aria-labelledby="delete-event-modal"
                    aria-describedby="delete-event-confirmation"
                    maxWidth="xs"
                    open={!!deleteEventModalUuid}
                >
                    <DialogTitle id="confirmation-delete-event-title">Delete Event</DialogTitle>
                    <DialogContent>
                        <p>Are you sure you want to delete this event?</p>
                        <p><b>{events.find(e => e.uuid ===deleteEventModalUuid).name}</b></p>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={() => setDeleteEventModalUuid('')} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteEvent} color="primary">
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
        </Card>
    );
}

const calculateRows = function ({ chores, events, filters, selectedTags, sorts, todaySkippedChores }) {
    const items = Object.values({ ...formatChores(chores), ...formatEvents(events) });

    return stableSort(items.filter(item => {
        if (item.type === 'event') return true;
        const foundEvent = items.find(duplicateItem => duplicateItem.type === 'event' && duplicateItem.choreUuid === item.uuid);
        return !foundEvent;
    }).filter(item => {
        let keep = !filters.length;

        filters.forEach(filter => {
            if (keep === true) return;
            const { name, operator, value } = filter;
            if (!name || !operator || (Array.isArray(value) ? !value.length : !value)) {
                keep = true;
                return;
            }

            if (operator === 'includes') {
                if (value.includes(item[name])) {
                    keep = true;
                    return;
                }
            } else if (operator === '!includes') {
                if (!value.includes(item[name])) {
                    keep = true;
                    return;
                }
            }
        });
        let matchesAllTags = true;
        if (selectedTags.length) {
            if(!item.tags.length) {
                matchesAllTags = false;
            } else {
                const itemTags = item.tags.map(t => t.uuid);
                selectedTags.forEach(t => {
                    if (!itemTags.includes(t)) {
                        matchesAllTags = false;
                    }
                });
            }
        }
        const skippedTodayChore = todaySkippedChores.find(chore => {
            return chore.uuid === item.uuid && isToday(new Date(chore.date));
        });

        return matchesAllTags && keep && !skippedTodayChore;
    }), sorts);
};
