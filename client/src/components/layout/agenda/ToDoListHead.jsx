import FilterMenu from './FilterMenu';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import PropTypes from 'prop-types';
import { toDoListStyles as useStyles } from './styles';
export default function ToDoListHead({
    headCells,
    order,
    orderBy,
    onRequestSort,
    onFilterChange
}) {
    const classes = useStyles();
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
                        align={headCell.dataType === 'number' ? 'right' : 'left'}
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

ToDoListHead.propTypes = {
    onFilterChange: PropTypes.func.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};
