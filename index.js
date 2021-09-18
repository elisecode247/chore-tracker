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
        const queryString = 'SELECT id, uuid, email, password as saved_password, settings FROM "user" WHERE email = $1';
        const result = await database.query(queryString, [username]);
        if (!result.rows.length) return done(null, false);
        const { saved_password: savedPassword, ...user } = result.rows[0];
        const match = await bcrypt.compare(password, savedPassword);
        if (!match) return done(null, false);
        if (match) return done(null, user);

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
                c.start_at,
                c.end_at,
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
        WITH ins1 AS (
            INSERT INTO "chore" as c (
                user_id,
                name,
                description,
                frequency,
                start_at,
                end_at,
                has_time
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id AS chore_id
        ), ins2 AS (
            SELECT id as tag_id FROM tag WHERE uuid = ANY($8::uuid[])
        )
            INSERT INTO chore_tag (chore_id, tag_id)
            SELECT chore_id, tag_id
            FROM   ins1, ins2
        `;
        await database.query(queryString, [
            req.user.id,
            req.body.name,
            req.body.description,
            req.body.frequency,
            req.body.start_at,
            req.body.end_at,
            req.body.has_time,
            req.body.selectedTags
        ]);
        res.send({ success: true });
    } catch (err) {
        res.send({ success: false, error: err });
    }
});

app.put('/api/v1/chores', verifyToken, async (req, res) => {
    try {
        const params = Object.entries(req.body).reduce((acc, param)=> {
            const [paramName, paramValue] = param;
            if (paramName === 'uuid') return acc;
            if (paramName === 'selectedTags') return acc;
            if ((typeof paramValue !== 'boolean' && !paramValue)) return acc;
            const index = acc.length + 1 || 1;
            return [
                ...acc,
                {
                    paramKey: `$${index}`,
                    paramName,
                    paramValue
                }
            ];
        }, []);
        const queryString = req.body.selectedTags && !req.body.selectedTags.length ? `
            WITH ins1 AS (
                UPDATE chore as c
                SET
                    ${params.map(p => `${p.paramName} = ${p.paramKey}`).join(', ')}
                WHERE c.uuid = $${params.length + 1}
                RETURNING id as chore_id
            )
            DELETE FROM chore_tag USING ins1 WHERE chore_tag.chore_id = ins1.chore_id
        ` : !req.body.selectedTags ? `
            UPDATE chore as c
                SET
                    ${params.map(p => `${p.paramName} = ${p.paramKey}`).join(', ')}
                WHERE c.uuid = $${params.length + 1}
                RETURNING id as chore_id
        ` : `
            WITH ins1 AS (
                UPDATE chore as c
                SET
                    ${params.map(p => `${p.paramName} = ${p.paramKey}`).join(', ')}
                WHERE c.uuid = $${params.length + 1}
                RETURNING id as chore_id
            ), ins2 AS (
                SELECT tag.id as tag_id FROM tag WHERE uuid = ANY($${params.length + 2}::uuid[])
            ), ins3 AS (
                DELETE FROM chore_tag USING ins1 WHERE chore_tag.chore_id = ins1.chore_id
            )
            INSERT INTO chore_tag (chore_id, tag_id)
            SELECT chore_id, tag_id
            FROM ins1, ins2
            ON CONFLICT(chore_id, tag_id) DO NOTHING
        `;

        const values = [
            ...Object.values(params).map(p => p.paramValue),
            req.body.uuid,
            ...(req.body.selectedTags && req.body.selectedTags.length ? [ req.body.selectedTags ] : [])
        ];
        await database.query(queryString, values);

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
            SELECT e.*, c.name, c.uuid as chore_uuid
            FROM event as e
            INNER JOIN chore as c ON e.chore_id = c.id
            WHERE c.user_id = $1
        `, [req.user.id]);
        res.send({ success: true, data: result.rows });
    } catch (err) {
        res.send({ success: false, error: err });
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

app.delete('/api/v1/events', verifyToken, async (req, res) => {
    try {
        const queryString = `
            DELETE FROM "event"
            WHERE uuid = $1
        `;
        await database.query(queryString, [req.body.uuid]);
        res.send({ success: true });
    } catch (err) {
        console.error(err);
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
            const user = { ...req.user, settings: result.rows[0].settings };
            res.send({ success: true, data: { user, token: jwt.sign(user, accessTokenSecret) }});
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

