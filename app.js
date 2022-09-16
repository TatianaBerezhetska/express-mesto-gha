const express = require('express');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const cors = require('cors');

const { PORT = 3000 } = process.env;

const app = express();
const mongoose = require('mongoose');
const { login, createUser } = require('./controllers/user');
const userRouter = require('./routes/user');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const urlRegExp = require('./utils/RegExp');
const NotFoundError = require('./errors/not-found-err');
const DefaultError = require('./errors/default-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());

const options = {
  origin: [
    'https://localhost:3010',
    'http://localhost:3010',
    'https://berezhetska.students.nomoredomains.sbs',
    'http://berezhetska.students.nomoredomains.sbs',
    'https://TatianaBerezhetska.github.io',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

app.use('*', cors(options));

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(urlRegExp),
  }),
}), createUser);

app.use('/users', auth, userRouter);
app.use('/cards', auth, cardsRouter);

app.use((req, res, next) => {
  next(new NotFoundError('Страница по указанному маршруту не найдена'));
});

app.use(errorLogger);

app.use(errors());

app.use(DefaultError);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
