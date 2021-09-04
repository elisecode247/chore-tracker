import React from 'react';
import Card from '@material-ui/core/Card';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import { useGetChoresQuery } from '../../../slices/choresApiSlice';
import { useGetTodayEventsQuery } from '../../../slices/eventsApiSlice';
import { formatChores, formatEvents } from '../../../utilities/chores';
import { getComparator, stableSort } from './utilities';
import ToDoListHead from './ToDoListHead';
import ToDoListItem from './ToDoListItem';
import { toDoListStyles as useStyles } from './styles';

export default function ToDoList() {
    const classes = useStyles();
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('name');
    const { data: chores, error: choresError, isLoading: isChoresLoading } = useGetChoresQuery();
    const { data: events, error: eventsError, isLoading: isEventsLoading } = useGetTodayEventsQuery();
    const items = Object.values({ ...formatChores(chores), ...formatEvents(events) });
    const rows = items.filter(item => {
        if (item.type === 'event') return true;
        const foundEvent = items.find(duplicateItem => duplicateItem.type === 'event' && duplicateItem.choreUuid === item.uuid);
        return !foundEvent;
    });

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleFilterChange = (event, property) => {

    };

    if (choresError || eventsError) {
        return (<div>Error</div>);
    }

    if (isChoresLoading || isEventsLoading) {
        return (<div>Loading...</div>);
    }

    return (
        <Card className={classes.root} elevation={3}>
            <TableContainer>
                <Table
                    className={classes.table}
                    aria-labelledby="tableTitle"
                    size={'medium'}
                    aria-label="enhanced table"
                >
                    <ToDoListHead
                        classes={classes}
                        order={order}
                        orderBy={orderBy}
                        onFilterChange={handleFilterChange}
                        onRequestSort={handleRequestSort}
                        rowCount={rows.length}
                    />
                    <TableBody>
                        {stableSort(rows, getComparator(order, orderBy))
                            .map((row, key) => {
                                const labelId = `enhanced-table-checkbox-${key}`;
                                return (
                                    <ToDoListItem key={key} labelId={labelId} row={row} />
                                );
                            })
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
