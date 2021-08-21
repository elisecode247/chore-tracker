const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const database = require('./database.js');
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

database.connect();

app.get('/api/v1/chores', async (req, res) => {
    try {
        database.query(`
            SELECT
                c.uuid,
                c.name,
                c.description,
                c.enabled,
                c.frequency,
                c.reason,
                c.location,
                c.scheduled_at,
                c.has_time,
                (
                    SELECT
                        array_to_json(array_agg(row_to_json(e)))
                    FROM (
                        SELECT
                            t.uuid, t.name
                        FROM "chore_tag" as e
                        INNER JOIN tag as t ON t.id = e.tag_id
                        WHERE e.chore_id=c.id
                    ) e
                ) as tags,
                (
                    SELECT
                        array_to_json(array_agg(row_to_json(e)))
                    FROM (
                        SELECT
                            uuid,
                            location,
                            notes,
                            started_at,
                            status,
                            completed_at
                        FROM "event" as e
                        WHERE e.chore_id=c.id AND e.status= 'done'
                        ORDER by e.completed_at desc
                        LIMIT 10
                    ) e
                ) as history
            FROM chore as c
            INNER JOIN "user" as u ON c.user_id = u.id
            WHERE u.id = 1
            `, (err, results) => {
            if (err) throw err;
            res.send({success: true, data: results.rows});
        });
    } catch (err) {

        res.send('Error ' + err);
    }
});

app.post('/api/v1/chores', cors(), async (req, res) => {
    try {
        const queryString = `
            INSERT INTO "chore" as c (
                user_id,
                name,
                description,
                frequency,
                scheduled_at,
                has_time,
                location,
                reason
            )
            VALUES (
                1,
                '${req.body.name}',
                '${req.body.description}',
                '${req.body.frequency}',
                '${req.body.scheduledAt}',
                '${!req.body.hasTime}',
                '${req.body.location}',
                '${req.body.reason}'
            )
            RETURNING id`;

        database.query(queryString, (err, result) => {
            if (err) throw err;
            if (req.body.selectedTags.length) {
                const queryString = `
                    INSERT INTO chore_tag (chore_id, tag_id)
                    SELECT ${result.rows[0].id} as chore_id, t.id
                    FROM (SELECT id FROM tag WHERE uuid in ('${req.body.selectedTags.join('\', \'')}')) t`;
                database.query(queryString, (err) => {
                    if (err) throw err;
                    res.send({success: true});
                });
            } else {
                res.send({success: true});
            }
        });
    } catch (err) {
        
        res.send({success: false, error: err});
    }
});

app.put('/api/v1/chores/:chore_uuid', cors(), async (req, res) => {

    try {
        const queryString = `
            UPDATE "chore"
            SET scheduled_at = '${req.body.scheduledAt}'
            WHERE uuid = '${req.params.chore_uuid}'`;

        database.query(queryString, (err) => {
            if (err) throw err;
            res.send({success: true});
        });
    } catch (err) {
        
        res.send({success: false, error: err});
    }
});

app.put('/api/v1/chores', cors(), async (req, res) => {
    try {
        const queryString = `
            UPDATE "chore"
            SET
                user_id = 1,
                name = '${req.body.name}',
                description = '${req.body.description}',
                frequency = '${req.body.frequency}',
                scheduled_at = '${req.body.scheduledAt}',
                has_time = '${!req.body.hasTime}',
                location = '${req.body.location}',
                reason = '${req.body.reason}'
            WHERE uuid = '${req.body.uuid}'`;
        // TODO update tags
        database.query(queryString, (err) => {
            if (err) throw err;
            res.send({success: true});
        });
    } catch (err) {
        
        res.send({success: false, error: err});
    }
});


app.get('/api/v1/events/incomplete', async (req, res) => {
    try {
        database.query(`
            SELECT
                c.name,
                e.uuid,
                e.started_at,
                e.completed_at,
                e.completed_by,
                e.location,
                e.notes
            FROM event as e
            INNER JOIN chore as c ON e.chore_id = c.id
            WHERE status != 'done'
        `, (err, results) => {
            if (err) throw err;
            res.send({success: true, data: results.rows});
        });
    } catch (err) {
        
        res.send('Error ' + err);
    }
});

app.get('/api/v1/events/today', async (req, res) => {
    try {
        database.query(`
            SELECT
                c.name,
                c.uuid as chore_uuid,
                c.scheduled_at,
                c.has_time,
                c.frequency,
                (
                    SELECT
                        array_to_json(array_agg(row_to_json(e)))
                    FROM (
                        SELECT
                            t.uuid, t.name
                        FROM "chore_tag" as e
                        INNER JOIN tag as t ON t.id = e.tag_id
                        WHERE e.chore_id=c.id
                    ) e
                ) as tags,
                e.uuid,
                e.started_at,
                e.completed_at,
                e.completed_by,
                e.location,
                e.status,
                e.notes
            FROM event as e
            INNER JOIN chore as c ON e.chore_id = c.id
            WHERE
                c.user_id = 1 AND
                ((status = 'done' AND DATE(e.completed_at) = CURRENT_DATE) OR
                (status IS NOT NULL AND status != 'done'))
        `, (err, results) => {
            if (err) throw err;
            res.send({success: true, data: results.rows});
        });
    } catch (err) {
        
        res.send('Error ' + err);
    }
});

app.get('/api/v1/events', async (req, res) => {
    try {
        database.query(`
            SELECT e.*, c.*
            FROM event as e
            INNER JOIN chore as c ON e.chore_id = c.id
            WHERE status = 'done'
        `, (err, results) => {
            if (err) throw err;
            res.send({success: true, data: results.rows});
        });
    } catch (err) {
        
        res.send('Error ' + err);
    }
});

app.put('/api/v1/events', async (req, res) => {
    try {
        const queryString = `UPDATE event
            SET
                ${!req.body.location ? '' : `location = '${req.body.location}',`}
                ${!req.body.notes ? '' : `notes = '${req.body.notes}',`}
                ${!req.body.startedAt ? '' : `started_at = '${req.body.startedAt}',`}
                ${!req.body.completedAt ? '' : `completed_at = '${req.body.completedAt}',`}
                ${!req.body.status ? '' : `status = '${req.body.status}',`}
                completed_by = 1
            WHERE uuid = '${req.body.uuid}'`;

        database.query(queryString, (err) => {
            if (err) throw err;
            res.send({success: true});
        });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.post('/api/v1/events', async (req, res) => {
    try {
        const queryString = `INSERT INTO event (
            chore_id,
            ${!req.body.location ? '' : 'location,'}
            ${!req.body.notes ? '' : 'notes,'}
            ${!req.body.startedAt ? '' : 'started_at,'}
            ${!req.body.completedAt ? '' : 'completed_at,'}
            status,
            completed_by
        )
        SELECT
            c.id as chore_id,
            ${!req.body.location ? '' : `'${req.body.location}' as location,`}
            ${!req.body.notes ? '' : `'${req.body.notes}' as notes,`}
            ${!req.body.startedAt ? '' : `'${req.body.startedAt}' as started_at,`}
            ${!req.body.completedAt ? '' : `'${req.body.completedAt}' as completed_at,`}
            '${req.body.status}' as status,
            1 as completed_by
        FROM (SELECT id FROM chore WHERE uuid = '${req.body.choreUuid}') c`;
        database.query(queryString, (err) => {
            if (err) throw err;
            res.send({success: true});
        });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.get('/api/v1/tags', async (req, res) => {
    try {
        database.query(`
            SELECT uuid, name, description
            FROM tag as t
        `, (err, results) => {
            if (err) throw err;
            res.send({success: true, data: results.rows});
        });
    } catch (err) {
        
        res.send('Error ' + err);
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
    console.info(`Example app listening at http://localhost:${port}`);
});


