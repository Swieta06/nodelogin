require("dotenv").config();
const { Pool } = require("pg");
const isProduction = process.env.NODE_ENV === "production";
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
});

// module.exports = { pool };
// const Pool = require("pg").Pool;
// const pool = new Pool({
//   user: "postgres",
//   password: "postgres",
//   database: "nodelogin",
//   host: "localhost",
//   port: 5432,
// });
module.exports = { pool };