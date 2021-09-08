import compareDesc from 'date-fns/compareDesc';

export const columns = [
    { id: 'name', dataType: 'string', disablePadding: true, label: 'To Do', forMobile: true },
    { id: 'status', dataType: 'string', disablePadding: false, label: 'Status', forMobile: true },
    { id: 'dueDate', dataType: 'date', disablePadding: false, label: 'Due', forMobile: true },
    { id: 'frequency', dataType: 'string', disablePadding: false, label: 'Frequency', forMobile: false },
    { id: 'lastCompletedDate', dataType: 'date', disablePadding: false, label: 'Last Done', forMobile: false },
];

const descendingComparator = function (a, b, orderBy) {
    const column = columns.find(cell => cell.id === orderBy);

    if (column.dataType === 'date') {
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

export function stableSort(array, sorts) {
    // TODO fix sort for multiple columns sorted in order
    const stabilizedThis = array.map((el, index) => [el, index]);
    sorts.forEach(sort => {
        if (!sort.name) return 0;
        const comparator = getComparator(sort.direction, sort.name);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
    });
    return stabilizedThis.map((el) => el[0]);
}
