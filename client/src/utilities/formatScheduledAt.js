import formatISO from 'date-fns/formatISO';

const formatScheduledAt = function(scheduledDate, scheduledTime) {
    const hasTime = !!scheduledTime;

    let scheduledAt;
    if (!hasTime) {
        scheduledAt = formatISO(scheduledDate);
    } else {
        const newDate = formatISO(scheduledDate, { representation: 'date' });
        const newTime = formatISO(scheduledTime, { representation: 'time' });
        scheduledAt = `${newDate}T${newTime}`;
    }
    return scheduledAt;
};

export default formatScheduledAt;
