import Journal from '../journal';
import ToDoList from './ToDoList';
import Typography from '@material-ui/core/Typography';
import format from 'date-fns/format';
import { DAY_OF_WEEK_AND_DATE } from '../../../constants/dateTimeFormats';
import { agendaStyles as useStyles } from './styles';

export default function Agenda() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Typography className={classes.h1} variant="h3" id="tableTitle" component="h1">
                Agenda
                <span className={classes.h1Subtitle}>
                    {format(new Date(), DAY_OF_WEEK_AND_DATE)}
                </span>
            </Typography>
            <Journal />
            <ToDoList />
        </div>
    );
}
