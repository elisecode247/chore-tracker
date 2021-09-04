import makeStyles from '@material-ui/core/styles/makeStyles';

export const agendaStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column'
    },
    toolbar: {
        width: '100%'
    },
    h1: {
        margin: '1rem'
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

export const toDoListStyles = makeStyles((theme) => ({
    root: {
        margin: '1rem'
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

export const toDoItemStyles = makeStyles((theme) => ({
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
    submitButton: {
        margin: 'auto 4px 13px 4px'
    }
}));
