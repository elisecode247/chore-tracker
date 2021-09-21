import {
    DATE_AND_TIME_FORMAT,
    DATE_FORMAT
} from '../../../constants/dateTimeFormats';
import format from 'date-fns/format';
import Button from '@material-ui/core/Button';
import ReactHtmlParser from 'react-html-parser';
import ButtonGroup from '@material-ui/core/ButtonGroup';

export default function AppointmentTooltip({
    appointmentData,
    onIgnoreChoreClick,
    onChoreDone,
    onChoreStart,
    onEventDone
}) {

    const handleIgnoreChore = function(evt){
        evt.stopPropagation();
        onIgnoreChoreClick(appointmentData.uuid);
    };

    const handleEventMarkDone = function(evt){
        evt.stopPropagation();
        onEventDone(appointmentData.uuid);
    };

    const handleMarkDone = function(evt){
        evt.stopPropagation();
        onChoreDone(appointmentData.uuid);
    };

    const handleMarkStart = function(evt){
        evt.stopPropagation();
        onChoreStart(appointmentData.uuid);
    };

    if (appointmentData.type === 'chore') {
        return (
            <div>
                <div style={{ textAlign: 'center' }}>
                    <small>Chore</small>
                    <h1>{appointmentData.text}</h1>
                    <p>{format(new Date(appointmentData.start_at), appointmentData.has_time ? DATE_AND_TIME_FORMAT : DATE_FORMAT)}</p>
                    <ButtonGroup>
                        <Button onClick={handleIgnoreChore} variant="outlined">Skip Today</Button>
                        <Button onClick={handleMarkStart} variant="outlined">Start Chore</Button>
                        <Button onClick={handleMarkDone} variant="outlined">Mark Done</Button>
                    </ButtonGroup>
                </div>
                <div>{ReactHtmlParser(appointmentData.description)}</div>
            </div>
        );
    } else {
        return (
            <div>
                <div style={{ textAlign: 'center' }}>
                    <small>Event</small>
                    <h1>{appointmentData.text}</h1>
                    <p>Start: {appointmentData.started_at ? format(new Date(appointmentData.started_at), DATE_AND_TIME_FORMAT) : ''}</p>
                    <p>Completed: {appointmentData.completed_at ? format(new Date(appointmentData.completed_at), DATE_AND_TIME_FORMAT) : ''}</p>
                    <p>{appointmentData.status}</p>
                    <ButtonGroup>
                        <Button onClick={handleEventMarkDone} variant="outlined">Mark Done</Button>
                    </ButtonGroup>
                </div>
                <p>{ReactHtmlParser(appointmentData.description)}</p>
            </div>
        );
    }

}
