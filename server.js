const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite Database
const db = new sqlite3.Database('./students.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create students table if it doesn't exist
function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      date_of_birth DATE,
      gender TEXT,
      address TEXT,
      course TEXT,
      enrollment_date DATE DEFAULT CURRENT_DATE,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Students table ready');
      insertSampleData();
    }
  });
}

// Insert sample data
function insertSampleData() {
  const checkQuery = "SELECT COUNT(*) as count FROM students";
  db.get(checkQuery, (err, row) => {
    if (err) {
      console.error('Error checking data:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const sampleStudents = [
        ['STU001', 'John', 'Doe', 'john.doe@email.com', '+1234567890', '2000-05-15', 'Male', '123 Main St, City', 'Computer Science'],
        ['STU002', 'Jane', 'Smith', 'jane.smith@email.com', '+1234567891', '1999-08-22', 'Female', '456 Oak Ave, City', 'Mathematics'],
        ['STU003', 'Mike', 'Johnson', 'mike.johnson@email.com', '+1234567892', '2001-03-10', 'Male', '789 Pine Rd, City', 'Physics']
      ];
      
      const insertQuery = `
        INSERT INTO students (student_id, first_name, last_name, email, phone, date_of_birth, gender, address, course)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      sampleStudents.forEach(student => {
        db.run(insertQuery, student, (err) => {
          if (err) {
            console.error('Error inserting sample data:', err.message);
          }
        });
      });
      
      console.log('Sample data inserted');
    }
  });
}

// Routes

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all students
app.get('/api/students', (req, res) => {
  const query = "SELECT * FROM students ORDER BY created_at DESC";
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ students: rows });
  });
});

// Get student by ID
app.get('/api/students/:id', (req, res) => {
  const query = "SELECT * FROM students WHERE id = ?";
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ student: row });
  });
});

// Add new student
app.post('/api/students', (req, res) => {
  const {
    student_id, first_name, last_name, email, phone,
    date_of_birth, gender, address, course, status
  } = req.body;
  
  const query = `
    INSERT INTO students (student_id, first_name, last_name, email, phone, date_of_birth, gender, address, course, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [student_id, first_name, last_name, email, phone, date_of_birth, gender, address, course, status || 'Active'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Student added successfully',
      student_id: this.lastID
    });
  });
});

// Update student
app.put('/api/students/:id', (req, res) => {
  const {
    student_id, first_name, last_name, email, phone,
    date_of_birth, gender, address, course, status
  } = req.body;
  
  const query = `
    UPDATE students 
    SET student_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?,
        date_of_birth = ?, gender = ?, address = ?, course = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(query, [student_id, first_name, last_name, email, phone, date_of_birth, gender, address, course, status, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ message: 'Student updated successfully' });
  });
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  const query = "DELETE FROM students WHERE id = ?";
  db.run(query, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

// Search students
app.get('/api/students/search/:term', (req, res) => {
  const searchTerm = `%${req.params.term}%`;
  const query = `
    SELECT * FROM students 
    WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR student_id LIKE ? OR course LIKE ?
    ORDER BY created_at DESC
  `;
  
  db.all(query, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ students: rows });
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const queries = {
    total: "SELECT COUNT(*) as count FROM students",
    active: "SELECT COUNT(*) as count FROM students WHERE status = 'Active'",
    inactive: "SELECT COUNT(*) as count FROM students WHERE status = 'Inactive'",
    courses: "SELECT course, COUNT(*) as count FROM students GROUP BY course ORDER BY count DESC"
  };
  
  const stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    if (key === 'courses') {
      db.all(query, (err, rows) => {
        if (err) {
          stats[key] = [];
        } else {
          stats[key] = rows;
        }
        completed++;
        if (completed === total) {
          res.json(stats);
        }
      });
    } else {
      db.get(query, (err, row) => {
        if (err) {
          stats[key] = 0;
        } else {
          stats[key] = row.count;
        }
        completed++;
        if (completed === total) {
          res.json(stats);
        }
      });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});