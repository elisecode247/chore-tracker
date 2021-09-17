import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import differenceInDays from 'date-fns/differenceInDays';
import endOfDay from 'date-fns/endOfDay';
import isValid from 'date-fns/isValid';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import isTomorrow from 'date-fns/isTomorrow';
import isThisMonth from 'date-fns/isThisMonth';
import set from 'date-fns/set';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import isToday from 'date-fns/isToday';
import {
    DATE_AND_TIME_FORMAT,
    DATE_FORMAT,
    DAY_OF_WEEK_AND_DATE,
    DAY_OF_WEEK_AND_DATE_AND_TIME,
    TIME_FORMAT
} from '../constants/dateTimeFormats';
import { endOfMonth } from 'date-fns';

function getDayOfWeekLabel(d) {
    switch (parseInt(d)) {
    case 0: return 'Sunday';
    case 1: return 'Monday';
    case 2: return 'Tuesday';
    case 3: return 'Wednesday';
    case 4: return 'Thursday';
    case 5: return 'Friday';
    case 6: return 'Saturday';
    default: return '';
    }
}
function parseFrequency(frequency) {
    if (!frequency) return null;
    try {
        return (frequency && JSON.parse(frequency)) || null;
    } catch (err) {
        return null;
    }
}

export function calculateDueDate(frequency, lastCompletedDate, chore) {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const scheduledAt = new Date(chore.scheduled_at);
    const scheduledTime = isValid(scheduledAt) ? { hours: getHours(scheduledAt), minutes: getMinutes(scheduledAt) } :
        { hours: getHours(today), minutes: getMinutes(today) };
    const scheduledDateTime = !isValid(scheduledAt) ? null : (chore.has_time ? set(scheduledAt, scheduledTime) : startOfDay(scheduledAt));
    const scheduledToday = chore.has_time ? set(today, scheduledTime) : startOfToday;

    if (!frequency) return scheduledDateTime;
    if (frequency.repeatType === 'once') {
        return scheduledDateTime;
    }
    if (frequency.repeatType === 'day') {
        if (isAfter(scheduledDateTime, endOfDay(today))) {
            return scheduledDateTime;
        } else if (!lastCompletedDate) {
            return scheduledToday;
        } else {
            let diff = frequency.repeatAmount - differenceInDays(startOfToday, startOfDay(lastCompletedDate));
            return addDays(scheduledToday, diff > 0 ? diff : 0);
        }
    }
    if (frequency.repeatType === 'week') {
        const scheduledDaysOfWeek = frequency.repeatSubtype.map(d => parseInt(d)).sort();
        if (isToday(scheduledDateTime) || isAfter(scheduledDateTime, endOfDay(today))) {
            if (!scheduledDaysOfWeek.length) {
                return scheduledDateTime;
            }
            let dateCounter = lastCompletedDate && isToday(lastCompletedDate) ? addDays(startOfToday, 1) : scheduledDateTime;
            let dayFound = false;
            while (!dayFound) {
                if (scheduledDaysOfWeek.includes(getDay(dateCounter))) {
                    dayFound = true;
                } else {
                    dateCounter = addDays(dateCounter, 1);
                }
            }
            return dateCounter;
        } else if (!lastCompletedDate && !scheduledDaysOfWeek.length) {
            return scheduledToday;
        } else if (lastCompletedDate && !scheduledDaysOfWeek.length) {
            let dueDate = addDays(lastCompletedDate, (7 * frequency.repeatAmount));
            return isBefore(dueDate, startOfToday) ? scheduledToday : dueDate;
        } else if (!lastCompletedDate && scheduledDaysOfWeek.length) {
            let dateCounter = scheduledToday;
            let dayFound = false;
            while (!dayFound) {
                if (scheduledDaysOfWeek.includes(getDay(dateCounter))) {
                    dayFound = true;
                } else {
                    dateCounter = addDays(dateCounter, 1);
                }
            }
            return dateCounter;
        } else if (lastCompletedDate && scheduledDaysOfWeek.length) {
            let dateCounter = isToday(lastCompletedDate) ? addDays(lastCompletedDate, 1) : lastCompletedDate;
            let dayFound = false;
            while (!dayFound) {
                if (scheduledDaysOfWeek.includes(getDay(dateCounter))) {
                    dayFound = true;
                } else {
                    dateCounter = addDays(dateCounter, 1);
                }
            }
            return dateCounter;
        } else {
            return null;
        }
    }
    if (frequency.repeatType === 'month') {
        if (frequency.repeatSubtype === 'first') {
            if (!lastCompletedDate && isAfter(scheduledDateTime, endOfDay(scheduledToday))) {
                return startOfMonth(scheduledDateTime);
            } else if (!lastCompletedDate && !isAfter(scheduledDateTime, endOfDay(scheduledToday))) {
                return scheduledToday;
            } else if (isAfter(scheduledDateTime, endOfMonth(scheduledToday))) {
                return startOfMonth(scheduledDateTime);
            } else if (isThisMonth(lastCompletedDate)) {
                return addMonths(startOfMonth(lastCompletedDate), frequency.repeatAmount);
            } else {
                const dueDate = addMonths(startOfMonth(lastCompletedDate), frequency.repeatAmount);
                return isBefore(dueDate, scheduledToday) ? scheduledToday : dueDate;
            }
        } else {
            // TO DO needs more options
            return scheduledDateTime;
        }
    }
    if (frequency.repeatType === 'year') {
        return scheduledDateTime;
    }
    return today;
}

function formatDueDate(dueDate, chore) {
    if (!dueDate || !isValid(dueDate)) return 'Unknown error';
    if (isToday(dueDate)) {
        return chore.has_time ? format(dueDate, TIME_FORMAT) : 'Today';
    }
    return chore.has_time ? format(dueDate, DAY_OF_WEEK_AND_DATE_AND_TIME) : format(dueDate, DAY_OF_WEEK_AND_DATE);
}

function getLastCompletedDate(history) {
    let completedDate = history && history[0] && history[0].completed_at && new Date(history[0].completed_at);
    return (isValid(completedDate)) ? completedDate : null;
}

function formatFrequency(chore) {
    /**  @type {{repeatType: String, repeatAmount: Number, repeatSubtype: String}} frequency */
    const frequency = parseFrequency(chore.frequency);
    const scheduledAt = chore.scheduled_at && new Date(chore.scheduled_at);
    const hasTime = !!chore.has_time && isValid(scheduledAt);
    const scheduledDateTime = (isValid(scheduledAt) && format(scheduledAt, hasTime ? DATE_AND_TIME_FORMAT : DATE_FORMAT)) || 'Unknown date';
    if (!frequency) return scheduledDateTime;

    // const scheduledDate = (scheduledAt && isValid(scheduledAt) && format(scheduledAt, DATE_FORMAT)) || false;
    const repeatType = frequency.repeatType;
    const repeatAmount = frequency.repeatAmount;
    const repeatSubtype = frequency.repeatSubtype;
    let startDate = '';

    if (scheduledAt && isValid(scheduledAt)) {
        if (isTomorrow(scheduledAt)) {
            startDate = 'starting tomorrow';
        } else if (isAfter(scheduledAt, new Date())) {
            startDate = `starting on ${format(scheduledAt, 'EEEE MMM d, yyyy')}`;
        } else {
            startDate = ` on ${format(scheduledAt, 'EEEE MMM d, yyyy')}`;
        }
    } else {
        startDate = 'Unknown date';
    }

    let startTime = (hasTime && scheduledAt && isValid(scheduledAt) && `at ${format(scheduledAt, TIME_FORMAT)}`) || '';


    if (repeatType === 'once') return scheduledDateTime;

    let when = '';

    if (repeatType === 'day') {
        if (repeatAmount <= 1) {
            when = 'Daily';
        } else {
            when = `Every ${repeatAmount} days`;
        }
        if (isAfter(scheduledAt, startOfDay(new Date()))) {
            when += ` ${startTime} ${startDate}`;
        }
        return when;
    }

    if (repeatType === 'week') {
        when = `Every ${repeatAmount <= 1 ? '' : repeatAmount} week`;
        if (hasTime) {
            when += ` ${startTime}`;
        }
        if (isAfter(scheduledAt, startOfDay(new Date()))) {
            when += ` ${startDate}`;
        }
        if (repeatSubtype.length) {
            when += ` on ${repeatSubtype.sort().map(d => getDayOfWeekLabel(d)).join(', ')}`;
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
        if (repeatSubtype === 'first') {
            return `First day of the month ${startDate} `;
        }
        subtypeString = `on ${monthSubTypes.find(monthSubtype => monthSubtype.value === repeatSubtype).label}`;
        return `Every ${repeatAmount} ${repeatType} ${subtypeString}`;

    }

    if (frequency.repeatType === 'year') {
        return `Every ${repeatAmount <= 1 ? ' year' : `${repeatAmount} years`} ${startDate} ${startTime}`;
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
            const formattedDueDate = formatDueDate(dueDate, chore);
            return {
                ...choreObject,
                [`chore-${chore.uuid}-0`]: {
                    enabled: chore.enabled,
                    type: 'chore',
                    uuid: chore.uuid,
                    name: chore.name,
                    lastCompletedDate,
                    formattedLastCompletedDate: (lastCompletedDate && format(lastCompletedDate, DATE_AND_TIME_FORMAT)) || 'Unknown',
                    dueDate,
                    formattedDueDate,
                    scheduledAt: chore.scheduled_at,
                    hasTime: !!(chore.has_time),
                    parsedFrequency,
                    formattedFrequency: formatFrequency(chore),
                    location: chore.location,
                    reason: chore.reason || '',
                    description: chore.description || '',
                    status: isToday(dueDate) ? 'attention' : 'upcoming',
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
                    formattedDueDate: formatDueDate(dueDate, event),
                    scheduledAt: event.scheduled_at,
                    hasTime: !!(event.has_time),
                    formattedFrequency: formatFrequency(event),
                    reason: event.reason || '',
                    description: event.description || '',
                    status: event.status || 'upcoming',
                    tags: event.tags || [],
                }
            };
        }, {});
}

export function formatFrequencyForServer({ repeatAmount = 1, repeatType }) {
    if (!repeatType) return '';
    if (!['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(repeatType)) return '';
    return `FREQ=${repeatType};INTERVAL=${repeatAmount};`;
}

export const repeatTypeNoun = {
    DAILY: 'day',
    WEEKLY: 'week',
    MONTHLY: 'month',
    YEARLY: 'year'
};
