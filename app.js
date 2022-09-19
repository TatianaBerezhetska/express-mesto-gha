const express = require('express');
require('dotenv').config();
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const cors = require('cors');

const { PORT = 3000 } = process.env;

const app = express();
const mongoose = require('mongoose');
const options = require('./utils/CORS-options');
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

app.use('*', cors(options));

app.use(requestLogger);

// crash-тест для проверки работы pm2 (рестарт приложения)
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

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

app.use(auth);

app.use('/users', userRouter);
app.use('/cards', cardsRouter);

app.use((req, res, next) => {
  next(new NotFoundError('Страница по указанному маршруту не найдена'));
});

app.use(errorLogger);

app.use(errors());

app.use(DefaultError);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
