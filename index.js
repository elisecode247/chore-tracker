const express = require('express');
const app = express();
const port = process.env.PORT;
const accessTokenSecret = process.env.JWT_SECRET;
const database = require('./database.js');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const jwt = require('jsonwebtoken');

database.connect();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

passport.use(new LocalStrategy(async function (username, password, done) {
    try {
        const queryString = `SELECT uuid, email FROM "user" WHERE email = '${username}' AND password = '${password}'`;
        const result = await database.query(queryString);
        if (!result.rows.length) return done(null, false);
        return done(null, result.rows[0]);
    } catch (err) {
        return done(err, null);
    }
}));

app.get('/api/v1/auth/local', async function (req, res) {
    if (!req.headers['authorization']){
        return res.send({ success: false, errorMessage: 'A server error occurred. Try again later' });
    }

    const bearerToken = req.headers['authorization'].split(' ')[1];
    try {
        const data = await jwt.verify(bearerToken, accessTokenSecret);
        res.send({ success: true, data });
    } catch (err) {
        res.send({ success: false, errorMessage: 'A server error occurred. Try again later' });
    }
});

app.post('/api/v1/auth/local',
    function (req, res, next) {
        passport.authenticate('local', function (err, user, _info, _status) {
            if (err) return res.send({ success: false, errorMessage: 'A server error occurred. Try again later' });
            if (!user) return res.send({ success: false, errorMessage: 'User does not exist.' });
            res.send({ success: true, data: {user, token: jwt.sign(user, accessTokenSecret)}});
        })(req, res, next);
    }
);

app.get('/api/v1/journal/today', verifyToken, async (req, res) => {
    try {
        database.query(`
            SELECT j.uuid, j.entry, j.entry_date
            FROM journal as j
            INNER JOIN "user" as u ON j.user_id = u.id
            WHERE u.uuid = '${req.user.uuid}' AND DATE(j.entry_date) = CURRENT_DATE
            `, (err, results) => {
            if (err) throw err;
            res.send({ success: true, data: results.rows });
        });
    } catch (err) {
        res.send({ success: false, errorMessage: 'A server error occurred.' });
    }
});

app.post('/api/v1/journal', verifyToken, async (req, res) => {
    try {
        const queryString = `INSERT INTO journal (
            user_id,
            entry,
            entry_date
        )
        VALUES (
            '${req.user.uuid}',
            '${req.body.entry}',
            '${req.body.entryDate}'
        )
        RETURNING id
        `;
        database.query(queryString, (err) => {
            if (err) throw err;
            res.send({ success: true });
        });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.put('/api/v1/journal', verifyToken, async (req, res) => {
    try {
        const queryString = `
            UPDATE journal
            SET entry = '${req.body.entry}'
            WHERE uuid = '${req.body.uuid}'
            RETURNING id
        `;
        database.query(queryString, (err) => {
            if (err) throw err;
            res.send({ success: true });
        });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.get('/api/v1/chores', verifyToken, async (req, res) => {
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
            WHERE c.user_id = (SELECT id FROM "user" WHERE uuid = '${req.user.uuid}')
            `, (err, results) => {
            if (err) throw err;
            res.send({ success: true, data: results.rows });
        });
    } catch (err) {
        res.send({ success: false, errorMessage: 'A server error occurred.' });
    }
});

app.post('/api/v1/chores', verifyToken, async (req, res) => {
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
                '${req.user.uuid}',
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
                    res.send({ success: true });
                });
            } else {
                res.send({ success: true });
            }
        });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.put('/api/v1/chores/:chore_uuid', verifyToken, async (req, res) => {

    try {
        const queryString = `
            UPDATE "chore"
            SET scheduled_at = '${req.body.scheduledAt}'
            WHERE uuid = '${req.params.chore_uuid}'`;

        database.query(queryString, (err) => {
            if (err) throw err;
            res.send({ success: true });
        });
    } catch (err) {

        res.send({ success: false, error: err });
    }
});

app.put('/api/v1/chores', verifyToken, async (req, res) => {
    try {
        const queryString = `
            UPDATE "chore"
            SET
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
            res.send({ success: true });
        });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.get('/api/v1/events/incomplete', verifyToken, async (req, res) => {
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
            WHERE
                status != 'done' AND
                c.user_id = (SELECT id FROM "user" WHERE uuid = '${req.user.uuid}')
        `, (err, results) => {
            if (err) throw err;
            res.send({ success: true, data: results.rows });
        });
    } catch (err) {
        res.send('Error ' + err);
    }
});

app.get('/api/v1/events/today', verifyToken, async (req, res) => {
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
                c.user_id = (SELECT id as id FROM "user" WHERE uuid = '${req.user.uuid}') AND
                ((status = 'done' AND DATE(e.completed_at) = CURRENT_DATE) OR
                (status IS NOT NULL AND status != 'done'))
        `, (err, results) => {
            if (err) throw err;
            res.send({ success: true, data: results.rows });
        });
    } catch (err) {

        res.send('Error ' + err);
    }
});

app.get('/api/v1/events', verifyToken, async (req, res) => {
    try {
        database.query(`
            SELECT e.*, c.*
            FROM event as e
            INNER JOIN chore as c ON e.chore_id = c.id
            WHERE
                status = 'done' AND
                c.user_id = (SELECT id as id FROM "user" WHERE uuid = '${req.user.uuid}')
        `, (err, results) => {
            if (err) throw err;
            res.send({ success: true, data: results.rows });
        });
    } catch (err) {

        res.send('Error ' + err);
    }
});

app.put('/api/v1/events', verifyToken, async (req, res) => {
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
            res.send({ success: true });
        });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.post('/api/v1/events', verifyToken, async (req, res) => {
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
            res.send({ success: true });
        });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.get('/api/v1/tags', verifyToken, async (req, res) => {
    try {
        database.query(`
            SELECT uuid, name, description
            FROM tag as t
        `, (err, results) => {
            if (err) throw err;
            res.send({ success: true, data: results.rows });
        });
    } catch (err) {

        res.send('Error ' + err);
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
    console.info(`App listening at port ${port}`);
});

function verifyToken (req, res, next) {
    if (!req.headers['authorization']) return res.sendStatus(403);
    const bearerToken = req.headers['authorization'].split(' ')[1];
    jwt.verify(bearerToken, accessTokenSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.token = bearerToken;
        req.user = {uuid: user.uuid};
        next();
    });
}

