import formatISO from 'date-fns/formatISO';

const formatScheduledAt = function(scheduledDate, scheduledTime) {
    if (!scheduledTime) {
        return formatISO(scheduledDate);
    } else {
        const newDate = formatISO(scheduledDate, { representation: 'date' });
        const newTime = formatISO(scheduledTime, { representation: 'time' });
        return `${newDate}T${newTime}`;
    }
};

export default formatScheduledAt;
