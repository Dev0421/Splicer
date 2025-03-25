const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const sheetRoutes = require('./routes/sheetRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', projectRoutes);
app.use('/api/sheets', sheetRoutes);  // Sheets API with Authentication
app.use('/api/files', fileRoutes);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
