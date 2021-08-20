import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

let db_pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
});

db_pool.on("error", (err) => console.log("connection ended", err));

export default db_pool;
