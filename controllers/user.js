const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const {
  ERR_BAD_REQUEST,
  ERR_UNAUTHORIZED,
  ERR_NOT_FOUND,
  ERR_CONFLICT,
  ERR_SERVER_ERROR,
} = require('../utils/errorCodes');

const SALT_ROUNDS = 10;

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
    .catch(() => {
      res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
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
        res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      } else if (err.statusCode === 404) {
        res.status(ERR_NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден.' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
      }
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      } else if (err.statusCode === 404) {
        res.status(ERR_NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден.' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
      }
    });
};

const createUser = (req, res) => {
  const {
    email,
    password,
    name,
    about,
    avatar,
  } = req.body;
  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => {
      User.create({
        email,
        password: hash,
        name,
        about,
        avatar,
      })
        .then((user) => {
          res.send({
            name: user.name, about: user.about, avatar: user.avatar, email: user.email,
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            res.status(ERR_BAD_REQUEST).send({ message: 'Одно из полей заполнено неверно' });
          } else if (err.name === 'MongoServerError' && err.code === 11000) {
            res.status(ERR_CONFLICT).send({ message: 'Пользователь с таким email уже существует' });
          } else {
            res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
          }
        });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'encrypted-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => {
      res.status(ERR_UNAUTHORIZED).send({ message: err.message });
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
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        if (err.errors.name) {
          res.status(ERR_BAD_REQUEST).send({ message: err.errors.name.message });
        } else if (err.errors.about) {
          res.status(ERR_BAD_REQUEST).send({ message: err.errors.about.message });
        } else {
          res.status(ERR_BAD_REQUEST).send({ message: 'Одно из полей заполнено неверно' });
        }
      } else if (err.name === 'CastError') {
        res.status(ERR_BAD_REQUEST).send({
          message: 'Переданы некорректные данные при обновлении профиля.',
        });
      } else if (err.statusCode === 404) {
        res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с указанным  _id не найден.' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
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
      if (err.name === 'ValidationError') {
        if (err.errors.avatar) {
          res.status(ERR_BAD_REQUEST).send({ message: err.errors.avatar.message });
        } else {
          res.status(ERR_BAD_REQUEST).send({ message: 'Поле заполнено неверно' });
        }
      } else if (err.name === 'CastError') {
        res.status(ERR_BAD_REQUEST).send({
          message: 'Переданы некорректные данные при обновлении аватара.',
        });
      } else if (err.statusCode === 404) {
        res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  getCurrentUser,
  createUser,
  login,
  updateUser,
  updateAvatar,
};
