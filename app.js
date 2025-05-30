const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();
const UserRoutes=require('./routes/UserRoutes')
const CandidateRoutes=require('./routes/CandidateRoutes')
const app = express();

// Middleware
app.use(express.json());  // for parsing request body
app.use(cors());


// Base route
app.get('/', function(req, res) {
    res.send('Welcome to our voting application');
});

app.use('/api',UserRoutes)
app.use('/api',CandidateRoutes)
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
