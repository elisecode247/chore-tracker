import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import PropTypes from 'prop-types';
import { toDoListStyles as useStyles } from './styles';
import { useSelector } from 'react-redux';
import FilterListIcon from '@material-ui/icons/FilterList';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

export default function ToDoListHead({
    headCells,
    order,
    orderBy,
    onRequestSort
}) {
    const classes = useStyles();
    const filters = useSelector((state) => state.agenda.filters);
    const sorts = useSelector((state) => state.agenda.sorts);

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox"></TableCell>
                {headCells.map((headCell) => {
                    const sort = sorts.find(s => s.name === headCell.id);
                    return (
                        <TableCell
                            key={headCell.id}
                            align={headCell.dataType === 'number' ? 'right' : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <div className={classes.tableCell}>
                                {filters.some(f => f.name === headCell.id) ? <FilterListIcon /> : null}
                                {headCell.label}
                                {sort ? sort.direction === 'asc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon /> : null}
                            </div>
                        </TableCell>
                    );
                })}
                <TableCell padding="checkbox"></TableCell>
            </TableRow>
        </TableHead>
    );
}

ToDoListHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};
