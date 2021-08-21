import startOfTomorrow from 'date-fns/startOfTomorrow';
import formatISO from 'date-fns/formatISO';

const formatScheduledAt = function(scheduledDate) {
    const newDate = formatISO(startOfTomorrow(), { representation: 'date' });
    const newTime = formatISO(new Date(scheduledDate), { representation: 'time' });
    const scheduledAt = `${newDate}T${newTime}`;
    return scheduledAt;
};

export default formatScheduledAt;
