import makeStyles from '@material-ui/core/styles/makeStyles';
import styles from '../../../styles';

const useStyles = makeStyles({
    root: {
        '& > *': {
            borderBottom: 'unset',
        },
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
    }
});

export default useStyles;
