const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.send({ message: 'Переданы некорректные данные.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
      }
    });
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные.' });
      } else if (err.statusCode === 404) {
        res.status(404).send({ message: 'Пользователь по указанному _id не найден.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400);
        res.send({
          message: 'Одно из полей короче 2-х символов или длиннее 30 символов.',
        });
      } else if (err.name === 'CastError') {
        res.send({ message: 'Переданы некорректные данные.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
      }
    });
};

const updateUser = (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    name: req.body.name,
    about: req.body.about,
  }, { new: true, runValidators: true })
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((user) => {
      if (
        req.body.name.length < 2
        || req.body.name.length > 30
        || req.body.about.length < 2
        || req.body.about.length > 30
      ) {
        res
          .status(400)
          .send({
            message:
              'Одно из полей короче 2-х символов или длиннее 30 символов.',
          });
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.send({
          message: 'Переданы некорректные данные при обновлении профиля.',
        });
      } else if (err.statusCode === 404) {
        res.status(404).send({ message: 'Пользователь с указанным  _id не найден.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
      }
    });
};

const updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    avatar: req.body.avatar,
  }, { new: true, runValidators: true })
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.send({
          message: 'Переданы некорректные данные при обновлении аватара.',
        });
      } else if (err.statusCode === 404) {
        res.send({ message: 'Пользователь с указанным _id не найден.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar,
};
