
require('dotenv').config();

const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.json());

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Original home route
app.get('/', (req, res) => {
  res.send('Welcome to the Book Category API');
});

// Original categories route
app.get('/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Fiction' },
    { id: 2, name: 'Non-Fiction' },
    { id: 3, name: 'Biography' }
  ]);
});

// Original about route
app.get('/about', (req, res) => {
  res.send('Hello! I am a student at Ngee Ann Polytechnic. I am learning Backend Development using Node.js and Express.');
});

// TEST 1 - GET all authors
app.get('/authors', async (req, res) => {
  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const result = await connection.request()
      .query('SELECT AuthorID, Name FROM Author ORDER BY AuthorID');

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });

  } finally {
    if (connection) await connection.close();
  }
});

// TEST 2, 3 and 7 - GET author by ID
app.get('/authors/:id', async (req, res) => {
  const authorId = Number(req.params.id);

  if (!Number.isInteger(authorId)) {
    return res.status(400).json({ error: 'Invalid author id' });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();

    request.input('id', sql.Int, authorId);

    const result = await request.query(
      'SELECT AuthorID, Name FROM Author WHERE AuthorID = @id'
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(200).json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });

  } finally {
    if (connection) await connection.close();
  }
});

// TEST 4 - POST create author 900
app.post('/authors', async (req, res) => {
  const { id, name } = req.body || {};

  if (!Number.isInteger(id) ||
      typeof name !== 'string' ||
      name.trim() === '') {
    return res.status(400).json({ error: 'Invalid author data' });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();

    request.input('id', sql.Int, id);
    request.input('name', sql.NVarChar, name);

    const result = await request.query(
      'INSERT INTO Author (AuthorID, Name) OUTPUT INSERTED.* VALUES (@id, @name)'
    );

    res.status(201).json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });

  } finally {
    if (connection) await connection.close();
  }
});

// TEST 5 - PUT update author 900
app.put('/authors/:id', async (req, res) => {
  const authorId = Number(req.params.id);
  const { name } = req.body || {};

  if (!Number.isInteger(authorId)) {
    return res.status(400).json({ error: 'Invalid author id' });
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Invalid author name' });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();

    request.input('id', sql.Int, authorId);
    request.input('name', sql.NVarChar, name);

    const result = await request.query(
      'UPDATE Author SET Name = @name OUTPUT INSERTED.* WHERE AuthorID = @id'
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(200).json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });

  } finally {
    if (connection) await connection.close();
  }
});

// TEST 6 - DELETE author 900
app.delete('/authors/:id', async (req, res) => {
  const authorId = Number(req.params.id);

  if (!Number.isInteger(authorId)) {
    return res.status(400).json({ error: 'Invalid author id' });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();

    request.input('id', sql.Int, authorId);

    const result = await request.query(
      'DELETE FROM Author WHERE AuthorID = @id'
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(204).send();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });

  } finally {
    if (connection) await connection.close();
  }
});

// Start server
app.listen(3000, () => {
  console.log('Listening on port 3000');
});
