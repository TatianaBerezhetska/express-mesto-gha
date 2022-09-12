const express = require('express');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');

const { PORT = 3000 } = process.env;

const app = express();
const mongoose = require('mongoose');
const { login, createUser } = require('./controllers/user');
const userRouter = require('./routes/user');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const urlRegExp = require('./utils/RegExp');

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());

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

app.use((req, res) => {
  res.status(404).send({ message: 'Страница по указанному маршруту не найдена' });
});

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });

  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
