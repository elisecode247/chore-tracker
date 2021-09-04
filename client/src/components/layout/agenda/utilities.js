import compareDesc from 'date-fns/compareDesc';

export const headCells = [
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

export function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}
