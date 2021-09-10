import makeStyles from '@material-ui/core/styles/makeStyles';

export const dragDownHoverStyles = {
    border: '1px dotted blue',
    borderBottom: '3px dashed blue',
    backgroundColor: 'lightgrey',
};

export const dragUpHoverStyles = {
    border: '1px dashed blue',
    backgroundColor: 'lightgrey',
    borderTop: '3px dashed blue'
};

export const isDraggingStyles = {
    border: '1px dashed grey',
    backgroundColor: '#fff03',
};

export const agendaStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column'
    },
    toolbar: {
        width: '100%'
    },
    h1: {
        margin: '0 0 1rem 0'
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

export const sortHeadStyles = makeStyles((theme) => ({
    root: {
        margin: '1rem 0'
    },
    sortsContainer: {
        margin: '0rem 0',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    sortContainer: {
        margin: '0.5rem 0',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        border: '1px dashed gray',
        padding: '0.5rem 1rem',
        marginBottom: '.5rem',
        cursor: 'move'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    formControlNumber: {
        margin: theme.spacing(1),
        width: 50
    },
    inline: {
        display: 'inline'
    }
}));

export const filterHeadStyles = makeStyles((theme) => ({
    root: {
        margin: '1rem 0',
        display: 'flex',
        alignItems: 'center'
    },
    filterContainer: {
        margin: '0',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'flex-start'
    },
    formControl: {
        margin: '0 0.5rem',
        minWidth: 120,
    },
    inline: {
        display: 'inline'
    }
}));

export const toDoListStyles = makeStyles((theme) => ({
    root: {
        padding: '1rem'
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
