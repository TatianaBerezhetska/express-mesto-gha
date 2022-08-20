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
        res.send({ message: 'Переданы некорректные данные.' });
      } else if (err.statusCode === 404) {
        res.send({ message: 'Пользователь по указанному _id не найден.' });
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
      if (err.name === 'CastError') {
        res.send({ message: 'Переданы некорректные данные.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
      }
    });
};

const updateUser = (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    name: req.params.name,
    about: req.params.about,
  })
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else if (err.statusCode === 404) {
        res.send({ message: 'Пользователь с указанным  _id не найден.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
      }
    });
};

const updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, {
    avatar: req.params.avatar,
  })
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.send({ message: 'Переданы некорректные данные при обновлении аватара.' });
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
