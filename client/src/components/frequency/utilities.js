import isValid from 'date-fns/isValid';
import isAfter from 'date-fns/isAfter';
import format from 'date-fns/format';
import isTomorrow from 'date-fns/isTomorrow';
import startOfDay from 'date-fns/startOfDay';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import {
    TIME_FORMAT
} from '../../constants/dateTimeFormats';
import set from 'date-fns/set';


function getDayOfWeekLabel(d) {
    switch(parseInt(d)){
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

export function formatFrequency({ hasTime, scheduledAt, frequencyAmount, frequencyType, frequencySubtype }) {
    const today = new Date();
    const scheduledTime = isValid(scheduledAt) ? { hours: getHours(scheduledAt), minutes: getMinutes(scheduledAt) } :
        { hours: getHours(today), minutes: getMinutes(today) };
    const scheduledDateTime = !isValid(scheduledAt) ? null : (hasTime ? set(scheduledAt, scheduledTime) : startOfDay(scheduledAt));

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


    if (frequencyType === 'once') return scheduledDateTime;

    let when = '';

    if (frequencyType === 'day') {
        if (frequencyAmount <= 1) {
            when = 'Daily';
        } else {
            when = `Every ${frequencyAmount} days`;
        }
        if(isAfter(scheduledAt, startOfDay(new Date()))) {
            when += ` ${startTime} ${startDate}`;
        }
        return when;
    }

    if (frequencyType === 'week') {
        when = `Every ${frequencyAmount <= 1 ? '' : frequencyAmount} week`;
        if (hasTime) {
            when += ` ${startTime}`;
        }
        if (isAfter(scheduledAt, startOfDay(new Date()))) {
            when += ` ${startDate}`;
        }
        if (frequencySubtype.length) {
            when += ` on ${frequencySubtype.sort().map(d => getDayOfWeekLabel(d)).join(', ')}`;
        }
        return when;
    }

    if (frequencyType === 'month') {
        let subtypeString = '';

        const monthSubTypes = [
            { label: 'the first day of the month', value: 'first' },
            { label: 'the last day of the month', value: 'last' },
            { label: 'day', value: 'day' }
        ];
        if (frequencySubtype === 'first') {
            return `First day of the month ${startDate} `;
        }
        subtypeString = `on ${monthSubTypes.find(monthSubtype => monthSubtype.value === frequencySubtype).label}`;
        return `Every ${frequencyAmount} ${frequencyType} ${subtypeString}`;

    }

    if (frequencyType === 'year') {
        return `Every ${frequencyAmount <= 1 ? ' year' : `${frequencyAmount} years`} ${startDate} ${startTime}`;
    }
    return 'Unknown';
}

export function getFrequencySubTypeOptions(frequencyType) {
    switch (frequencyType) {
    case 'day':
        return [];
    case 'week':
        return [
            { label: 'S', value: 0 },
            { label: 'M', value: 1 },
            { label: 'T', value: 2 },
            { label: 'W', value: 3 },
            { label: 'Th', value: 4 },
            { label: 'F', value: 5 },
            { label: 'S', value: 6 },
        ];
    case 'month':
        return [
            { label: 'first day of the month', value: 'first' },
            { label: 'last day of the month', value: 'last' },
            { label: 'day', value: 'day' },
        ];
    case 'year':
        return [];
    default:
        return [];
    }
}
