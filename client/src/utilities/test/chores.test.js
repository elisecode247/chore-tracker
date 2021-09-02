import { calculateDueDate } from '../chores';
import addDays from 'date-fns/addDays';
import getDay from 'date-fns/getDay';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import isSameDay from 'date-fns/isSameDay';
import set from 'date-fns/set';

describe('calculateDueDate', () => {
    it('returns due date on specific date this year', () => {
        const frequency = {
            'repeatType': 'year',
            'repeatAmount': 1,
            'repeatSubtype': ''
        };
        const lastCompletedDate = null;
        const chore = {
            'scheduled_at': '2021-07-20T05:47:00.000Z',
            'has_time': true
        };

        expect(calculateDueDate(frequency, lastCompletedDate, chore))
            .toEqual(new Date('2021-07-20T05:47:00.000Z'));
    });
    it('counts repeat amount 2 from lastCompletedDate', () => {
        const frequency = {
            'repeatType': 'day',
            'repeatAmount': 2,
            'repeatSubtype': ''
        };
        const lastCompletedDate = addDays(new Date(), -1);
        const chore = {
            'scheduled_at': '2021-07-20T05:47:00.000Z',
            'has_time': true
        };
        const scheduledAt = new Date(chore.scheduled_at);
        expect(isSameDay(calculateDueDate(frequency, lastCompletedDate, chore),
            addDays(set(new Date(), { hours: getHours(scheduledAt), minutes: getMinutes(scheduledAt) }), 1)))
            .toEqual(true);
    });
    it('counts repeat amount 4 from lastCompletedDate', () => {
        const frequency = {
            'repeatType': 'day',
            'repeatAmount': 4,
            'repeatSubtype': ''
        };
        const lastCompletedDate = addDays(new Date(), -2);
        const chore = {
            'scheduled_at': '2021-07-20T05:47:00.000Z',
            'has_time': true
        };
        const scheduledAt = new Date(chore.scheduled_at);
        expect(isSameDay(calculateDueDate(frequency, lastCompletedDate, chore),
            addDays(set(new Date(), { hours: getHours(scheduledAt), minutes: getMinutes(scheduledAt) }), 2))
        ).toEqual(true);
    });
    it('calculates due date for events completed today', () => {
        const frequency = {
            'repeatType': 'day',
            'repeatAmount': 1,
            'repeatSubtype': 'day'
        };
        const lastCompletedDate = '2021-09-02T01:29:28.160Z';
        const chore = {
            'scheduled_at': '2021-08-21T14:00:56.000Z',
            'has_time': false,
            'frequency': '{"repeatType":"day","repeatAmount":1,"repeatSubtype":"day"}',
            'started_at': null,
            'completed_at': '2021-09-02T01:29:28.160Z',
        };
        const scheduledAt = new Date(chore.scheduled_at);
        expect(isSameDay(calculateDueDate(frequency, new Date(lastCompletedDate), chore),
            addDays(set(new Date(), { hours: getHours(scheduledAt), minutes: getMinutes(scheduledAt) }), 1))
        ).toEqual(true);
    });
    it('calculates due date for weekly chores', () => {
        const frequency = {
            repeatType: 'week',
            repeatAmount: 1,
            repeatSubtype: [6]
        };
        const lastCompletedDate = null;
        const chore = {
            'frequency': '{"repeatType":"week","repeatAmount":1,"repeatSubtype":["6"]}',
            'scheduled_at': new Date(),
            'has_time': true
        };
        const received = calculateDueDate(frequency, lastCompletedDate, chore);
        let expected = new Date();
        let dayFound = false;
        while(!dayFound) {
            if(frequency.repeatSubtype.includes(getDay(expected))) {
                dayFound = true;
            } else {
                expected = addDays(expected, 1);
            }
        }
        expect(isSameDay(received, expected)).toEqual(true);
    });
});

