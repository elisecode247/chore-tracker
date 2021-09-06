import compareDesc from 'date-fns/compareDesc';

export const columns = [
    { id: 'name', dataType: 'string', disablePadding: true, label: 'To Do', forMobile: true, filter: false },
    { id: 'status', dataType: 'string', disablePadding: false, label: 'Status', forMobile: true, filter: true },
    { id: 'dueDate', dataType: 'date', disablePadding: false, label: 'Due', forMobile: true, filter: true },
    { id: 'frequency', dataType: 'string', disablePadding: false, label: 'Frequency', forMobile: false, filter: true },
    { id: 'lastCompletedDate', dataType: 'date', disablePadding: false, label: 'Last Done', forMobile: false, filter: false },
];

const descendingComparator = function (a, b, orderBy) {
    const dataType = columns.find(cell => cell.id === orderBy);

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
