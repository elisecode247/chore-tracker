export const defaultDescription = `
<article>
    <p>
        Steps:
    </p>
    <p>
        Items needed and where they are:
    </p>

    <p>
        Obstacles:
    </p>
    <p>
        Emotions you feel before, during, and after
    </p>
</article>
`;

export const defaultJournalSettings = {
    journalInstructions: 'Reminders about your values, priorities, or goals. ' +
        'Emotions you had and how you processed them. Make sure to avoid ruminations and think of solutions. ' +
        'A list of things that make you happy.',
    journalTemplate: ''
};

export const defaultUserSettings = {
    journalSettings: defaultJournalSettings,
    choreSettings: {
        choreTemplate: defaultDescription
    }
};
