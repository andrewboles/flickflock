/* eslint-disable global-require */
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const bodyParser = require('body-parser');

const { db } = require('./utils/db');

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(',')
  : [];
const corsOptions = {
  origin(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  credentials: true,
  exposedHeaders: ['set-cookie'],
};

if (process.env.VERCEL_ENV !== 'production') {
  // Load environment variables from .env file in non prod environments
  require('dotenv').config();
}

const middlewares = require('./middlewares');
const users = require('./routes/userRoutes');
const auth = require('./routes/authRoutes');
const posts = require('./routes/postRoutes');

const app = express();
require('./utils/passport');

if (process.env.VERCEL_ENV !== 'production') {
  app.use(cors(corsOptions));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(passport.initialize());
app.use(morgan('dev'));
app.use(helmet());

app.use(express.json());
db.$connect();
app.get('/', (req, res) => {
  res.json({
    message: '🛫✨💽💿 🎸🤘🏽🎸💿 💽✨🛬',
  });
});

app.use('/users', users);
app.use('/auth', auth);
app.use('/posts', posts);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
