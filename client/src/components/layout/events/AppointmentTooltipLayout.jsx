import {
    DATE_AND_TIME_FORMAT,
    DATE_FORMAT
} from '../../../constants/dateTimeFormats';
import format from 'date-fns/format';
import { Button } from '@material-ui/core';

export default function AppointmentTooltip({ appointmentData, onIgnoreChoreClick }) {

    const handleIgnoreChore = function(evt){
        evt.stopPropagation();
        onIgnoreChoreClick(appointmentData.uuid);
    };

    if (appointmentData.type === 'chore') {
        return (
            <div>
                <small>Chore</small>
                <h1>{appointmentData.name}</h1>
                <p>{format(new Date(appointmentData.start_at), appointmentData.has_time ? DATE_AND_TIME_FORMAT : DATE_FORMAT)}</p>
                <Button onClick={handleIgnoreChore}>Skip Today</Button>
            </div>
        );
    } else {
        return (
            <div>
                <h1>Event {appointmentData.name}</h1>
                <p>{format(new Date(appointmentData.start_at), appointmentData.has_time ? DATE_AND_TIME_FORMAT : DATE_FORMAT)}</p>
            </div>
        );
    }

}
