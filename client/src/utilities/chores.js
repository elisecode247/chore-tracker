import { addDays, format, isAfter, isBefore, isThisMonth, startOfMonth } from 'date-fns';
import isValid from 'date-fns/isValid';
import isTomorrow from 'date-fns/isTomorrow';
import isToday from 'date-fns/isToday';
import { DATE_AND_TIME_FORMAT, DATE_FORMAT, TIME_FORMAT } from '../constants/dateTimeFormats';

function parseFrequency(frequency) {
    if(!frequency) return null;
    try {
        return (frequency && JSON.parse(frequency)) || null;
    } catch(err) {
        return null;
    }
}

function calculateDueDate(frequency, lastCompletedDate, chore) {
    const scheduledAt = new Date(chore.scheduled_at);
    const today = new Date();
    if(!frequency && isValid(scheduledAt)) return scheduledAt;
    if(!frequency && isValid(scheduledAt)) return today;
    if(frequency.repeatType === 'once') {
        return scheduledAt;
    }
    if(frequency.repeatType === 'day') {
        if(!lastCompletedDate && (isBefore(scheduledAt, today) || isToday(scheduledAt))) {
            return scheduledAt;
        } else if(isAfter(scheduledAt, today)) {
            return scheduledAt;
        } else if(isBefore(lastCompletedDate, today)){
            return today;
        } else if(isToday(lastCompletedDate)) {
            return addDays(new Date(), 1);
        } else if(isAfter(lastCompletedDate, today)) {
            return scheduledAt;
        } else {
            return today;
        }
    }
    if(frequency.repeatType === 'week') {
        // let daysOfWeek = chore.repeatSubtype;
        if (isAfter(scheduledAt, today)) return scheduledAt;
    }
    if(frequency.repeatType === 'month') {
        if(frequency.repeatSubtype === 'first') {
            // if scheduledAt is after today, return scheduledAt
            if (isAfter(scheduledAt, today)) return scheduledAt;
            // if scheduledAt is before or today and lastCompletedAt is this month return tomorrow
            if ((isBefore(scheduledAt, today) || isToday(scheduledAt)) && isThisMonth(lastCompletedDate)) {
                return addDays(today, 1);
            }
            if ((isBefore(chore.scheduledAt, today) || isToday(scheduledAt)) && isBefore(lastCompletedDate, startOfMonth(today))) {
                return startOfMonth(today);
            }
        }
    }
    if(frequency.repeatType === 'year') {
        return scheduledAt;
    }
    return today;
}

function getLastCompletedDate(history) {
    let completedDate = history && history[0] && history[0].completed_at && new Date(history[0].completed_at);
    return (isValid(completedDate)) ? completedDate : null;
}

function formatFrequency(chore){
    /**  @type {{repeatType: String, repeatAmount: Number, repeatSubtype: String}} frequency */
    const frequency = parseFrequency(chore.frequency);
    const scheduledAt = chore.scheduled_at && new Date(chore.scheduled_at);
    const hasTime = !!chore.has_time && isValid(scheduledAt);
    const scheduledDateTime = (isValid(scheduledAt) && format(scheduledAt, hasTime ? DATE_AND_TIME_FORMAT : DATE_FORMAT)) || 'Unknown date';
    if(!frequency) return scheduledDateTime;

    // const scheduledDate = (scheduledAt && isValid(scheduledAt) && format(scheduledAt, DATE_FORMAT)) || false;
    const repeatType = frequency.repeatType;
    const repeatAmount = frequency.repeatAmount;
    const repeatSubtype = frequency.repeatSubtype;
    let startDate = '';

    if(scheduledAt && isValid(scheduledAt)) {
        if(isTomorrow(scheduledAt)) {
            startDate = 'starting tomorrow';
        } else if(isAfter(scheduledAt, new Date())) {
            startDate = `starting on ${format(scheduledAt, 'EEEE MMM d, yyyy')}`;
        } else {
            startDate = ` on ${format(scheduledAt, 'EEEE MMM d, yyyy')}`;
        }
    } else {
        startDate = 'Unknown date';
    }

    let startTime = (hasTime && scheduledAt && isValid(scheduledAt) && `at ${format(scheduledAt, TIME_FORMAT)}`) || '';


    if(repeatType === 'once') return scheduledDateTime;

    let when = '';

    if(repeatType === 'day') {
        if(repeatAmount <= 1) {
            when = 'Daily';
        } else {
            when = `Every ${repeatAmount} days`;
        }
        when += ` ${startTime} ${startDate}`;
        return when;
    }

    if(repeatType === 'week') {
        when = `Every ${repeatAmount <= 1 ? '' : repeatAmount} week`;
        // TO DO where I left off. AddChoreModal doesn't capture days of the week
        if(startDate) {
            when += ` ${startDate}`;
        }
        if(hasTime) {
            when += ` ${startTime}`;
        }
        if(repeatSubtype && Array.isArray(repeatSubtype)) {
            when += ` on ${repeatSubtype.join(', ')}`;
        }
        if(repeatSubtype && typeof repeatSubtype === 'string') {
            when += ` on ${repeatSubtype}`;
        }
        return when;
    }

    if (frequency.repeatType === 'month') {
        let subtypeString = '';

        const monthSubTypes = [
            { label: 'the first day of the month', value: 'first' },
            { label: 'the last day of the month', value: 'last' },
            { label: 'day', value: 'day' }
        ];
        if(repeatSubtype === 'first') {
            return `First day of the month ${startDate} `;
        }
        subtypeString = `on ${monthSubTypes.find(monthSubtype => monthSubtype.value === repeatSubtype).label}`;
        return `Every ${repeatAmount} ${repeatType} ${subtypeString}`;

    }

    if (frequency.repeatType === 'year') {
        return `Every ${repeatAmount <=1 ? ' year' : `${repeatAmount} years`} ${startDate} ${startTime}`;
    }
    return 'Unknown';
}

export function formatChores(chores) {

    if (!chores || !chores.length) return [];
    return chores
        .reduce((choreObject, chore, _index) => {
            const parsedFrequency = parseFrequency(chore.frequency);
            const lastCompletedDate = getLastCompletedDate(chore.history) || null;
            const dueDate = calculateDueDate(parsedFrequency, lastCompletedDate, chore);
            return {
                ...choreObject,
                [`chore-${chore.uuid}-0`]: {
                    type: 'chore',
                    uuid: chore.uuid,
                    name: chore.name,
                    lastCompletedDate,
                    formattedLastCompletedDate: (lastCompletedDate && format(lastCompletedDate, DATE_AND_TIME_FORMAT)) || 'Unknown',
                    dueDate,
                    formattedDueDate: format(dueDate, DATE_AND_TIME_FORMAT),
                    scheduledAt: chore.scheduled_at,
                    hasTime: chore.hasTime,
                    formattedFrequency: formatFrequency(chore),
                    reason: chore.reason || '',
                    description: chore.description || '',
                    status: chore.status || 'Not yet',
                    tags: chore.tags || []
                }
            };
        }, {});
}

export function formatEvents(events) {
    if (!events || !events.length) return [];
    return events
        .reduce((eventsObject, event, index) => {
            const parsedFrequency = parseFrequency(event.frequency);
            const lastCompletedDate = (event.completed_at && new Date(event.completed_at)) || null;
            const dueDate = calculateDueDate(parsedFrequency, lastCompletedDate, event) || null;
            return {
                ...eventsObject,
                [`chore-${event.chore_uuid}-${index}`]: {
                    type: 'event',
                    choreUuid: event.chore_uuid,
                    uuid: event.uuid,
                    name: event.name,
                    lastCompletedDate,
                    formattedLastCompletedDate: (lastCompletedDate && format(lastCompletedDate, DATE_AND_TIME_FORMAT)) || 'Unknown',
                    dueDate,
                    formattedDueDate: format(dueDate, DATE_AND_TIME_FORMAT),
                    scheduledAt: event.scheduled_at,
                    hasTime: !!event.has_time,
                    formattedFrequency: formatFrequency(event),
                    reason: event.reason || '',
                    description: event.description || '',
                    status: event.status || 'Not yet',
                    tags: event.tags || [],
                }
            };
        }, {});
}
