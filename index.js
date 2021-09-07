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
const bcrypt = require('bcrypt');

database.connect();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

passport.use(new LocalStrategy(async function (username, password, done) {
    try {
        const queryString = 'SELECT id, uuid, email, password, settings FROM "user" WHERE email = $1';
        const result = await database.query(queryString, [username]);
        if (!result.rows.length) return done(null, false);

        const match = await bcrypt.compare(password, result.rows[0].password);
        if (!match) return done(null, false);
        if (match) return done(null, result.rows[0]);

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

app.post('/api/v1/auth/local', function (req, res, next) {
    passport.authenticate('local', function (err, user, _info, _status) {
        if (err) return res.send({ success: false, errorMessage: 'A server error occurred. Try again later' });
        if (!user) return res.send({ success: false, errorMessage: 'User does not exist.' });
        res.send({ success: true, data: {user, token: jwt.sign(user, accessTokenSecret)}});
    })(req, res, next);
});

app.get('/api/v1/journal/today', verifyToken, async (req, res) => {
    try {
        const queryString = `
            SELECT j.uuid, j.entry, j.entry_date
            FROM journal as j
            WHERE j.user_id = $1 AND DATE(j.entry_date) = CURRENT_DATE
        `;
        const result = await database.query(queryString, [req.user.id]);
        res.send({ success: true, data: result.rows });
    } catch (err) {
        res.send({ success: false, errorMessage: 'A server error occurred.' });
    }
});

app.post('/api/v1/journal', verifyToken, async (req, res) => {
    try {
        const queryString = 'INSERT INTO journal (user_id, entry, entry_date) VALUES ($1, $2, $3)';
        await database.query(queryString, [req.user.id, req.body.entry, req.body.entryDate]);
        res.send({ success: true });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.put('/api/v1/journal', verifyToken, async (req, res) => {
    try {
        const queryString = 'UPDATE journal SET entry = $1 WHERE uuid = $2';
        await database.query(queryString, [req.body.entry, req.body.uuid]);
        res.send({ success: true });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.get('/api/v1/chores', verifyToken, async (req, res) => {
    try {
        const result = await database.query(`
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
            WHERE c.user_id = $1
        `, [req.user.id]);
        res.send({ success: true, data: result.rows });
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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `;
        const result = await database.query(queryString, [
            req.user.id,
            req.body.name,
            req.body.description,
            req.body.frequency,
            req.body.scheduledAt,
            req.body.hasTime,
            req.body.location,
            req.body.reason
        ]);
        if (result.rows.length && req.body.selectedTags.length) {
            const queryString = `
                INSERT INTO chore_tag (chore_id, tag_id)
                SELECT $1 as chore_id, t.id
                FROM (SELECT id FROM tag WHERE uuid in ANY($2::int[])) t
            `;
            await database.query(queryString, [result.rows[0].id, req.body.selectedTags]);
            res.send({ success: true });
        } else {
            res.send({ success: true });
        }
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.put('/api/v1/chores/:chore_uuid', verifyToken, async (req, res) => {
    try {
        const queryString = 'UPDATE "chore" SET scheduled_at = $1 WHERE uuid = $2';
        await database.query(queryString, [req.body.scheduledAt, req.columns.chore_uuid]);
        res.send({ success: true });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.put('/api/v1/chores', verifyToken, async (req, res) => {
    try {
        const queryString = `
            UPDATE chore
            SET
                name = $1,
                description = $2,
                frequency = $3,
                scheduled_at = $4,
                has_time = $5,
                location = $6,
                reason = $7
            WHERE uuid = $8
        `;
        // TODO update tags
        await database.query(queryString, [
            req.body.name,
            req.body.description,
            req.body.frequency,
            req.body.scheduledAt,
            req.body.hasTime,
            req.body.location,
            req.body.reason,
            req.body.uuid
        ]);
        res.send({ success: true });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.get('/api/v1/events/incomplete', verifyToken, async (req, res) => {
    try {
        const result = await database.query(`
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
                c.user_id = $1
        `, [req.user.id]);
        res.send({ success: true, data: result.rows });
    } catch (err) {
        res.send({success: false, error: err});
    }
});

app.get('/api/v1/events/today', verifyToken, async (req, res) => {
    try {
        const queryString = `
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
                c.user_id = $1 AND
                ((status = 'done' AND DATE(e.completed_at) = CURRENT_DATE) OR
                (status IS NOT NULL AND status != 'done'))
        `;
        const result = await database.query(queryString, [req.user.id]);
        res.send({ success: true, data: result.rows });
    } catch (err) {
        res.send('Error ' + err);
    }
});

app.get('/api/v1/events', verifyToken, async (req, res) => {
    try {
        const result = await database.query(`
            SELECT e.*, c.*
            FROM event as e
            INNER JOIN chore as c ON e.chore_id = c.id
            WHERE
                status = 'done' AND
                c.user_id = $1)
        `, [req.user.id]);
        res.send({ success: true, data: result.rows });
    } catch (err) {
        res.send('Error ' + err);
    }
});

app.put('/api/v1/events', verifyToken, async (req, res) => {
    try {
        const params = Object.entries(req.body).reduce((acc, param)=> {
            const [paramName, paramValue] = param;
            if (paramName === 'uuid') return acc;
            if (!paramValue) return acc;
            const index = Object.keys(acc) && Object.keys(acc).length + 1 || 1;
            return {
                ...acc,
                [`$${index}`]: {
                    paramKey: `$${index}`,
                    paramName,
                    paramValue
                }
            };
        }, {});
        const queryString = `
            UPDATE event
            SET
                ${Object.values(params).map(p => ` ${p.paramName} = ${p.paramKey}, `).join('')}
                completed_by = $${Object.values(params).length + 1}
            WHERE uuid = $${Object.values(params).length + 2}
        `;

        await database.query(queryString, [
            ...Object.values(params).map(p => p.paramValue),
            req.user.id,
            req.body.uuid
        ]);
        res.send({ success: true });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.post('/api/v1/events', verifyToken, async (req, res) => {
    try {
        const queryString = `
            INSERT INTO "event" (
                chore_id,
                status,
                completed_at,
                completed_by
            )
            SELECT
                c.id as chore_id,
                $1 as status,
                $2 as completed_at,
                $3 as completed_by
            FROM (SELECT id FROM chore WHERE uuid = $4) c
        `;
        await database.query(queryString, [
            req.body.status,
            req.body.completed_at,
            req.user.id,
            req.body.choreUuid
        ]);
        res.send({ success: true });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.get('/api/v1/tags', verifyToken, async (req, res) => {
    try {
        const queryString = 'SELECT uuid, name, description FROM tag as t WHERE user_id = $1';
        const result = await database.query(queryString,[req.user.id]);
        res.send({ success: true, data: result.rows });
    } catch (err) {
        res.send({success: false, error: err});
    }
});

app.put('/api/v1/user/settings', verifyToken, async (req, res) => {
    try {
        const queryString = 'UPDATE "user" SET settings = $1 WHERE id = $2 RETURNING settings';
        const result = await database.query(queryString, [req.body, req.user.id]);
        if (!result.rows.length) {
            res.send({ success: false, errorMessage: 'An unknown error occurred.' });
        } else {
            res.send({ success: true, data: result.rows[0].settings });
        }
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
    console.info(`App listening at port ${port}`);
});

async function verifyToken (req, res, next) {
    try {
        if (!req.headers['authorization']) return res.sendStatus(403);
        const bearerToken = req.headers['authorization'].split(' ')[1];
        const user = await jwt.verify(bearerToken, accessTokenSecret);
        req.token = bearerToken;
        req.user = user;
        next();
    } catch (e) {
        res.sendStatus(403);
    }
}

