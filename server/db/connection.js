const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDirectory = path.join(__dirname, "..", "..", "data");
const databasePath = path.join(dataDirectory, "meetingspot.db");

fs.mkdirSync(dataDirectory, { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

module.exports = { db };