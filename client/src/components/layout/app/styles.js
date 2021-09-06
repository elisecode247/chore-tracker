import makeStyles from '@material-ui/core/styles/makeStyles';

export const appTabStyles = makeStyles((theme) => ({
    root: {
        textAlign: 'center'
    },
    tabs: {
        display: 'flex',
        flexWrap: 'wrap',
        '&> div > div': {
            flexWrap: 'wrap'
        }
    }
}));
