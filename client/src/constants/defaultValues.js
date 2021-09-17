export const defaultDescription = `
<article>
    <h1>Chore Description</h1>
    <h2>Steps</h2>
        <ol><li></li><li></li><li></li></ol>
    <h2>Items needed and where they are</h2>
        <ul><li></li><li></li><li></li></ul>
    <h2>Obstacles</h2>
    <p>What makes this chore more difficult is</p>
    <h2>Your Emotions</h2>
    <p>My Feelings leading up to this are</p>
    <h2>Location</h2>
    <p></p>
    <h2>Time Estimate</h2>
    <p></p>
    <h2>Positive Consequences for Completing</h2>
    <p></p>
    <h2>Negative Consequences for Not Doing or Delaying</h2>
    <p></p>
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
