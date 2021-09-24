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
    onChoreDoneScheduled,
    onChoreDoneNow,
    onChoreStart,
    onEventDone,
    schedulerRef
}) {

    const handleIgnoreChore = function(evt){
        evt.stopPropagation();
        onIgnoreChoreClick(appointmentData.uuid);
    };

    const handleMarkEventDone = function(evt){
        evt.stopPropagation();
        onEventDone(appointmentData.uuid);
    };

    const handleMarkChoreDoneScheduled = function(evt){
        evt.stopPropagation();
        onChoreDoneScheduled(appointmentData);
    };

    const handleMarkChoreDoneNow = function(evt){
        evt.stopPropagation();
        onChoreDoneNow(appointmentData.uuid);
    };

    const handleChoreMarkStart = function(evt){
        evt.stopPropagation();
        onChoreStart(appointmentData.uuid);
    };

    const handleModalClick = function(evt){
        evt.stopPropagation();
        schedulerRef.current.instance.hideAppointmentTooltip();
        schedulerRef.current.instance.hideAppointmentPopup();
    };

    if (appointmentData.type === 'chore') {
        return (
            <div onClick={handleModalClick}>
                <div style={{ textAlign: 'center' }}>
                    <small>Chore</small>
                    <h1>{appointmentData.text}</h1>
                    <p>{format(new Date(appointmentData.start_at), appointmentData.has_time ? DATE_AND_TIME_FORMAT : DATE_FORMAT)}</p>
                    <ButtonGroup style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button onClick={handleIgnoreChore} variant="outlined">Skip Today</Button>
                        <Button onClick={handleChoreMarkStart} variant="outlined">Start Chore</Button>
                        <Button onClick={handleMarkChoreDoneScheduled} variant="outlined">Mark Done Scheduled</Button>
                        <Button onClick={handleMarkChoreDoneNow} variant="outlined">Mark Done Now</Button>
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
                        <Button onClick={handleMarkEventDone} variant="outlined">Mark Done</Button>
                    </ButtonGroup>
                </div>
                <p>{ReactHtmlParser(appointmentData.description)}</p>
            </div>
        );
    }

}
