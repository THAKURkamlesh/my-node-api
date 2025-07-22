const express = require('express');
const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
// AWS Secrets Manager Setup
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getDBCredentials(secretId) {
  const secret = await secretsManager.getSecretValue({ SecretId: secretId }).promise();
  return JSON.parse(secret.SecretString);
}

async function getDBConnection() {
  const secretId = 'arn:aws:secretsmanager:us-east-1:686255981020:secret:final-dev-rds-secret-ut164y';
  const credentials = await getDBCredentials(secretId);

  return mysql.createConnection({
    host: 'final-db.c8n024gueq01.us-east-1.rds.amazonaws.com',
    user: credentials.username,
    password: credentials.password,
    database: 'testdb'
  });
}

// ✅ Read all users
app.get('/users', async (req, res) => {
  try {
    const connection = await getDBConnection();
    const [users] = await connection.execute('SELECT * FROM users');
    await connection.end();
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ➕ Create a new user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const connection = await getDBConnection();
    const [result] = await connection.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    await connection.end();
    res.json({ message: 'User created', id: result.insertId });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✏️ Update user
app.put('/users/:id', async (req, res) => {
  const { name, email } = req.body;
  const userId = req.params.id;
  try {
    const connection = await getDBConnection();
    await connection.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );
    await connection.end();
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ❌ Delete user
app.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const connection = await getDBConnection();
    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    await connection.end();
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Node.js + RDS + Github + SecretsManager CRUD API is running!');
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
