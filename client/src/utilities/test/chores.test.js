import { calculateDueDate } from '../chores';

describe('calculateDueDate', () => {
    it('due date is on specific date this year', () => {
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
});

