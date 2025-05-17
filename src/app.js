const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const tokenRoutes = require('./routes/tokenRoutes');
app.use('/api/token', tokenRoutes);

app.listen(port, () => {
    console.log(`Example app running on http://localhost:${port}`);
});
