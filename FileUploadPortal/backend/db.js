const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "Fileportal",
    password: "thenu",
    port: 5432,
});

module.exports = pool;