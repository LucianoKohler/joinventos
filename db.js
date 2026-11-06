const { Pool } = require('pg');

const pool = new Pool({
    host: "127.0.0.1",
    user: "postgres",
    port: "5433",
    password: "postgres",
    database: "joinventos",
});

module.exports = pool;