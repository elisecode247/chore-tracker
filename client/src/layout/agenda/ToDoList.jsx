import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import FilterMenu from './FilterMenu';
import { useGetChoresQuery } from '../../slices/choresApiSlice';
import { useGetTodayEventsQuery } from '../../slices/eventsApiSlice';
import { formatChores, formatEvents } from '../../utilities/chores';
import { DAY_OF_WEEK_AND_DATE } from '../../constants/dateTimeFormats';
import compareDesc from 'date-fns/compareDesc';
import format from 'date-fns/format';
import ToDoListItem from './ToDoListItem';

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    { id: 'name', numeric: false, disablePadding: true, label: 'To Do', filter: false },
    { id: 'status', numeric: false, disablePadding: false, label: 'Status', filter: true },
    { id: 'dueDate', numeric: true, disablePadding: false, label: 'Due', filter: true },
    { id: 'frequency', numeric: false, disablePadding: false, label: 'Frequency', filter: true },
    { id: 'lastCompletedDate', numeric: true, disablePadding: false, label: 'Last Done', filter: false },
];

const descendingComparator = function (a, b, orderBy) {
    const dataType = headCells.find(cell => cell.id === orderBy);

    if (dataType.numeric) {
        if (!a[orderBy] && !b[orderBy]) {
            return 0;
        }
        if (!a[orderBy]) {
            return -1;
        }
        if (!b[orderBy]) {
            return 1;
        }
        return compareDesc(a[orderBy], b[orderBy]);
    }

    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }

    return 0;
};

function EnhancedTableHead(props) {
    const { classes, order, orderBy, onRequestSort, onFilterChange } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
    const handleFilterChange = (event, property) => {
        onFilterChange(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox"></TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <div className={classes.tableCell}>
                            {headCell.filter ? (
                                <FilterMenu filterType={headCell.id} onFilterChange={handleFilterChange} />
                            ) : null}
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                <span className={classes.visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </span>
                            </TableSortLabel>
                        </div>
                    </TableCell>
                ))}
                <TableCell padding="checkbox"></TableCell>
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    filterIcon: {
        '&:hover': {
            color: 'orange'
        }
    },
    h1: {
        fontSize: '1.5rem'
    },
    h1Subtitle: {
        fontSize: '1rem',
        marginLeft: '1rem'
    },
    table: {
        minWidth: 750,
    },
    tableCell: {
        display: 'flex'
    },
    editableTableCell: {
        '&:hover': {
            color: 'orange',
            cursor: 'pointer'
        }
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1,
    },
}));

export default function EnhancedTable() {
    const classes = useStyles();
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('name');
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event) => {
        setDense(event.target.checked);
    };

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows && (rows.length - page * rowsPerPage));

    if (choresError || eventsError) {
        return (<div>Error</div>);
    }

    if (isChoresLoading || isEventsLoading) {
        return (<div>Loading...</div>);
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Toolbar className={clsx(classes.root)}>
                    <Typography className={classes.h1} variant="h1" id="tableTitle" component="div">
                        Agenda
                        <span className={classes.h1Subtitle}>{format(new Date(), DAY_OF_WEEK_AND_DATE)}</span>
                    </Typography>
                </Toolbar>
                <TableContainer>
                    <Table
                        className={classes.table}
                        aria-labelledby="tableTitle"
                        size={dense ? 'small' : 'medium'}
                        aria-label="enhanced table"
                    >
                        <EnhancedTableHead
                            classes={classes}
                            order={order}
                            orderBy={orderBy}
                            onFilterChange={handleFilterChange}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {stableSort(rows, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, key) => {
                                    const labelId = `enhanced-table-checkbox-${key}`;
                                    return (
                                        <ToDoListItem key={key} labelId={labelId} row={row} />
                                    );
                                })
                            }
                            {emptyRows > 0 && (
                                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            <FormControlLabel
                control={<Switch checked={dense} onChange={handleChangeDense} />}
                label="Dense padding"
            />
        </div>
    );
}
