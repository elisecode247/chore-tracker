export function formatGetDoneTodayEvents(events){
    if(!events || !events.length) return [];

    return events.map(event => {
        return {
            completedAt: (event.completed_at && new Date(event.completed_at)) || null,
            location: event.location || '',
            name: event.name,
            notes: event.notes || '',
            startedAt: (event.started_at && new Date(event.started_at)) || null,
            uuid: event.uuid,
        };
    });
}
