import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Database Configuration
const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'staff_breaks',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
    });

// Έλεγχος σύνδεσης με τη βάση κατά την εκκίνηση
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ΣΦΑΛΜΑ ΣΥΝΔΕΣΗΣ: Ο κωδικός ή ο χρήστης είναι λάθος.');
    console.error('Μήνυμα σφάλματος:', err.message);
    return;
  }
  console.log('✅ Επιτυχής σύνδεση στην PostgreSQL!');
  release();
});

// STAFF ENDPOINTS
app.get('/api/staff', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff ORDER BY name ASC');
    const mapped = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      role: row.role,
      isActive: row.is_active
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  const { id, name, role, isActive } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO staff (id, name, role, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, role, isActive]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      role: row.role,
      isActive: row.is_active
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM staff WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BREAKS ENDPOINTS
app.get('/api/breaks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM breaks ORDER BY created_at DESC');
    const mapped = result.rows.map(row => ({
      id: row.id,
      staffName: row.staff_name,
      supervisorName: row.supervisor_name,
      date: row.date.toISOString().split('T')[0],
      shift: row.shift,
      schedule: row.schedule,
      break30_1_From: row.break30_1_from || '',
      break30_1_To: row.break30_1_to || '',
      break30_2_From: row.break30_2_from || '',
      break30_2_To: row.break30_2_to || '',
      break10_1_From: row.break10_1_from || '',
      break10_1_To: row.break10_1_to || '',
      break10_2_From: row.break10_2_from || '',
      break10_2_To: row.break10_2_to || '',
      createdAt: parseInt(row.created_at)
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/breaks', async (req, res) => {
  const entries = req.body;
  try {
    const results = [];
    for (const entry of entries) {
      const result = await pool.query(
        `INSERT INTO breaks (
          id, staff_name, supervisor_name, date, shift, schedule, 
          break30_1_from, break30_1_to, break30_2_from, break30_2_to, 
          break10_1_from, break10_1_to, break10_2_from, break10_2_to, 
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [
          entry.id, entry.staffName, entry.supervisorName, entry.date, entry.shift, entry.schedule,
          entry.break30_1_From, entry.break30_1_To, entry.break30_2_From, entry.break30_2_To,
          entry.break10_1_From, entry.break10_1_To, entry.break10_2_From, entry.break10_2_To,
          entry.createdAt
        ]
      );
      results.push(result.rows[0]);
    }
    const mappedResults = results.map(row => ({
      id: row.id,
      staffName: row.staff_name,
      supervisorName: row.supervisor_name,
      date: row.date.toISOString().split('T')[0],
      shift: row.shift,
      schedule: row.schedule,
      break30_1_From: row.break30_1_from,
      break30_1_To: row.break30_1_to,
      break30_2_From: row.break30_2_from,
      break30_2_To: row.break30_2_to,
      break10_1_From: row.break10_1_from,
      break10_1_To: row.break10_1_to,
      break10_2_From: row.break10_2_from,
      break10_2_To: row.break10_2_to,
      createdAt: parseInt(row.created_at)
    }));
    res.status(201).json(mappedResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/breaks', async (req, res) => {
  const entries = req.body;
  try {
    for (const entry of entries) {
      await pool.query(
        `UPDATE breaks SET 
          staff_name = $2, supervisor_name = $3, date = $4, shift = $5, schedule = $6,
          break30_1_from = $7, break30_1_to = $8, break30_2_from = $9, break30_2_to = $10,
          break10_1_from = $11, break10_1_to = $12, break10_2_from = $13, break10_2_to = $14,
          created_at = $15
        WHERE id = $1`,
        [
          entry.id, entry.staffName, entry.supervisorName, entry.date, entry.shift, entry.schedule,
          entry.break30_1_From, entry.break30_1_To, entry.break30_2_From, entry.break30_2_To,
          entry.break10_1_From, entry.break10_1_To, entry.break10_2_From, entry.break10_2_To,
          entry.createdAt
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

// Serve static files from the React app build directory
const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(buildPath, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
