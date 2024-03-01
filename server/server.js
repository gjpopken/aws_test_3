const express = require('express');
const app = express();
const PORT = 5001

// ! Route Includes
const evidenceRouter = require('./routes/evidence.router');


// ! Express Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('build'));

// ! Routes
app.use('/api/evidence', evidenceRouter);

// Listen Server & Port
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});