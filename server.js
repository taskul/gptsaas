require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const errorHandler = require('./middleware/error');
const cookieParser = require('cookie-parser');
const path = require('path');


// Security middleware
const helmet = require('helmet');
app.use(helmet());

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// We encoded our request raw bodies in a way that the stripe API will be able to interpret them.
const rawBodySaver = function (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}
app.use(bodyParser.json({verify: rawBodySaver, extended: true}));


// Enable trust proxy based on the environment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Adjust based on your production proxy setup
} else {
  app.set('trust proxy', process.env.TRUST_PROXY || 'loopback'); // Secure setting for development
}

// connect to database
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

const PORT = process.env.WEBSITES_PORT || 8080;
app.use(express.json());

// connect to routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/openai', require('./routes/openai'));
app.use('/api/stripe', require('./routes/stripe'));
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// setting this up after azure deployment
const node_env = process.env.APPSETTING_NODE_ENV;

// connecting react and rendering front end as a static application
if (node_env === 'production') {
  app.use(express.static('./client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
};

module.exports = { app, server }; 
