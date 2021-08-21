const { Client } = require('pg');
const databaseUrl = 'postgres://elisestraub:password@localhost:5432/chores';
const client = new Client({
    connectionString: process.env.DATABASE_URL || databaseUrl
});

module.exports = client;