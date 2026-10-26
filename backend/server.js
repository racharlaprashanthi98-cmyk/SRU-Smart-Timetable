
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create/open database file inside backend folder
const db = new Database(path.join(__dirname, "timetable.db"));

// Create timetable table
db.exec(`
  CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year TEXT NOT NULL,
    section TEXT NOT NULL,
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    subject TEXT NOT NULL,
    faculty TEXT NOT NULL,
    room TEXT NOT NULL
  )
`);

// Insert sample data only when table is empty
const count = db.prepare(
  "SELECT COUNT(*) AS total FROM timetable"
).get();

if (count.total === 0) {
  const insert = db.prepare(`
    INSERT INTO timetable
    (year, section, day, time, subject, faculty, room)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run("3", "A", "Monday", "9:00 AM - 10:00 AM",
    "Data Structures", "Faculty A", "Room 101");

  insert.run("3", "A", "Monday", "10:00 AM - 11:00 AM",
    "Machine Learning", "Faculty B", "Room 102");
}

// Test route
app.get("/", (req, res) => {
  res.send("Smart College Timetable Backend is running!");
});

// Get timetable with optional filters
app.get("/api/timetable", (req, res) => {
  const { year, section, day } = req.query;

  let sql = "SELECT * FROM timetable WHERE 1=1";
  const params = [];

  if (year) {
    sql += " AND year = ?";
    params.push(year);
  }

  if (section) {
    sql += " AND section = ?";
    params.push(section);
  }

  if (day) {
    sql += " AND lower(day) = lower(?)";
    params.push(day);
  }

  sql += " ORDER BY id";

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// Add timetable entry
app.post("/api/timetable", (req, res) => {
  const { year, section, day, time, subject, faculty, room } = req.body;

  if (![year, section, day, time, subject, faculty, room]
    .every(value => typeof value === "string" && value.trim())) {
    return res.status(400).json({
      message: "Please provide all timetable fields."
    });
  }

  const result = db.prepare(`
    INSERT INTO timetable
    (year, section, day, time, subject, faculty, room)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    year.trim(), section.trim(), day.trim(), time.trim(),
    subject.trim(), faculty.trim(), room.trim()
  );

  res.status(201).json({
    message: "Timetable entry added successfully",
    id: result.lastInsertRowid
  });
});

// Update timetable entry
app.put("/api/timetable/:id", (req, res) => {
  const { year, section, day, time, subject, faculty, room } = req.body;

  if (![year, section, day, time, subject, faculty, room]
    .every(value => typeof value === "string" && value.trim())) {
    return res.status(400).json({
      message: "Please provide all timetable fields."
    });
  }

  const result = db.prepare(`
    UPDATE timetable
    SET year=?, section=?, day=?, time=?, subject=?, faculty=?, room=?
    WHERE id=?
  `).run(
    year.trim(), section.trim(), day.trim(), time.trim(),
    subject.trim(), faculty.trim(), room.trim(),
    req.params.id
  );

  if (result.changes === 0) {
    return res.status(404).json({ message: "Entry not found" });
  }

  res.json({ message: "Timetable updated successfully" });
});

// Delete timetable entry
app.delete("/api/timetable/:id", (req, res) => {
  const result = db.prepare(
    "DELETE FROM timetable WHERE id = ?"
  ).run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Entry not found" });
  }

  res.json({ message: "Timetable entry deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const batch7Timetable = [
  // MONDAY
  ["Monday", "13:30-14:30", "Algorithms (Practical)", "Dr. Kabitha Raojori", "Not specified"],
  ["Monday", "14:30-15:30", "Algorithms (Practical)", "Dr. Kabitha Raojori", "Not specified"],
  ["Monday", "15:30-16:30", "Critical Thinking and Interpersonal Skills", "Dr. Prabhudutta Samal", "Not specified"],
  ["Monday", "16:30-17:30", "Critical Thinking and Interpersonal Skills", "Dr. Prabhudutta Samal", "Not specified"],

  // TUESDAY
  ["Tuesday", "08:30-09:30", "Artificial Intelligence and Deep Learning (Tutorial)", "Dr. Syed Ali Hussain", "Not specified"],
  ["Tuesday", "09:30-10:30", "Critical Thinking and Interpersonal Skills", "Dr. Prabhudutta Samal", "Not specified"],
  ["Tuesday", "10:30-11:30", "Critical Thinking and Interpersonal Skills", "Dr. Prabhudutta Samal", "Not specified"],
  ["Tuesday", "11:30-12:30", "Algorithms", "Dr. Kabitha Raojori", "Not specified"],
  ["Tuesday", "12:30-13:30", "Algorithms", "Dr. Kabitha Raojori", "Not specified"],

  // WEDNESDAY
  ["Wednesday", "08:30-09:30", "Algorithms", "Dr. Kabitha Raojori", "Not specified"],
  ["Wednesday", "09:30-10:30", "Algorithms", "Dr. Kabitha Raojori", "Not specified"],
  ["Wednesday", "10:30-11:30", "Software Engineering and System Design", "Dr. Asha S", "Not specified"],
  ["Wednesday", "11:30-12:30", "Artificial Intelligence and Deep Learning", "Dr. Syed Ali Hussain", "Not specified"],
  ["Wednesday", "12:30-13:30", "Statistics for Computer Science", "Dr. Sudipta Phiyadarsini", "Not specified"],
  ["Wednesday", "13:30-14:30", "Artificial Intelligence and Deep Learning (Practical)", "Dr. Syed Ali Hussain", "Not specified"],
  ["Wednesday", "14:30-15:30", "Artificial Intelligence and Deep Learning (Practical)", "Dr. Syed Ali Hussain", "Not specified"],

  // THURSDAY
  ["Thursday", "09:30-10:30", "Software Engineering and System Design", "Dr. Asha S", "Not specified"],
  ["Thursday", "10:30-11:30", "Artificial Intelligence and Deep Learning", "Dr. Syed Ali Hussain", "Not specified"],
  ["Thursday", "11:30-12:30", "Algorithms", "Dr. Kabitha Raojori", "Not specified"],
  ["Thursday", "12:30-13:30", "Algorithms (Practical)", "Dr. Kabitha Raojori", "Not specified"],
  ["Thursday", "15:30-16:30", "Software Engineering and System Design (Practical)", "Dr. Asha S", "Not specified"],

  // FRIDAY
  ["Friday", "08:30-09:30", "Artificial Intelligence and Deep Learning (Practical)", "Dr. Syed Ali Hussain", "Not specified"],
  ["Friday", "09:30-10:30", "Artificial Intelligence and Deep Learning", "Dr. Syed Ali Hussain", "Not specified"],
  ["Friday", "10:30-11:30", "Software Engineering and System Design", "Dr. Asha S", "Not specified"],
  ["Friday", "11:30-12:30", "Software Engineering and System Design (Practical)", "Dr. Asha S", "Not specified"],
  ["Friday", "12:30-13:30", "Statistics for Computer Science", "Dr. Sudipta Phiyadarsini", "Not specified"],
  ["Friday", "14:30-15:30", "Algorithms", "Dr. Kabitha Raojori", "Not specified"]
];

const addBatch7 = db.prepare(`
  INSERT INTO timetable
  (year, section, day, time, subject, faculty, room)
  SELECT ?, ?, ?, ?, ?, ?, ?
  WHERE NOT EXISTS (
    SELECT 1 FROM timetable
    WHERE year = ? AND section = ? AND day = ?
      AND time = ? AND subject = ?
  )
`);

const insertBatch7 = db.transaction(() => {
  for (const [day, time, subject, faculty, room] of batch7Timetable) {
    addBatch7.run(
      "3", "A", day, time, subject, faculty, room,
      "3", "A", day, time, subject
    );
  }
});

insertBatch7();
console.log("Batch 7 timetable entries added.");
