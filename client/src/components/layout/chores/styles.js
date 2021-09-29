import makeStyles from '@material-ui/core/styles/makeStyles';
import styles from '../../../styles';

export const addChorePanelStyles = makeStyles((theme) => ({

    buttonContainer: {
        padding: '1rem 0 1rem 0'
    },
    descriptionInput: {
        marginTop: '2rem',
        overflowY: 'auto',
        maxHeight: '100px'
    },
    entryContainer: {
        margin: '1rem 0 0 0'
    },
    fab: {
        backgroundColor: styles.accent
    },
    formControl: {
        display: 'block',
        marginRight: '1rem',
        marginBottom: '1rem',
        minWidth: 120,
    },
    inlineBlock: {
        display: 'inline-block'
    },
    and: {
        display: 'inline-block',
        padding: '1rem',
        fontWeight: 700
    },
    nameInput: {
        marginBottom: '1rem'
    },
    switchFormControl: {
        margin: '1rem 0 1rem 0'
    },
    tagSelect: {
        minWidth: '100px'
    },
    tagSelectFormControl: {
        display: 'block',
        margin: '1rem 0 1rem 0'
    },
    weekdaysContainer: {
        display: 'flex',
        flexDirection: 'row',
        '&> label': {
            margin: 0,
            padding: 4,
            borderBottom: '1px solid grey',
            borderTop: '1px solid grey',
            borderLeft: '1px solid grey'
        },
        '&> label:last-child': {
            borderRight: '1px solid grey'
        }
    }
}));

export const choresListStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    borderRight: {
        borderRight: '1px solid grey'
    },
    appBar: {
        color: 'white'
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

export const choresListRowStyles = makeStyles({
    root: {
        '& > *': {
            borderBottom: 'unset',
        },
    },
    inline: {
        display: 'inline'
    },
    tableCell: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRight: '1px solid grey'
    },
    tableContents: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    borderRight: {
        borderRight: '1px solid grey'
    },
    editButton: {
        color: styles.accentTwo,
        '&:hover': {
            color: '#684dc9',
            cursor: 'pointer'
        }
    },
    enabled: {
        color: styles.accent
    },
    disabled: {
        color: 'grey'
    },
    historyContainer: {
        backgroundColor: '#fffaf5',
        border: '1px solid darkgrey',
        margin: 'auto -1rem',
        padding: '1rem',
    },
    tagSelect: {
        minWidth: '120px'
    },
    h4: {
        marginTop: '2rem'
    },
    weekdaysContainer: {
        display: 'flex',
        flexDirection: 'row',
        '&> label': {
            margin: 0,
            padding: 4,
            borderBottom: '1px solid grey',
            borderTop: '1px solid grey',
            borderLeft: '1px solid grey'
        },
        '&> label:last-child': {
            borderRight: '1px solid grey'
        }
    }
});

export const filterHeadStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center'
    },
    fontColor: {
        color: 'white'
    },
    filterContainer: {
        margin: '0',
        padding: '0 1rem',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'flex-start'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        color: 'white',
        border: '1px solid white'
    },
    inline: {
        display: 'inline'
    }
}));
