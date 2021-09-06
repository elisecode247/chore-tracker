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
    tagSelect: {
        minWidth: '100px'
    }
}));
