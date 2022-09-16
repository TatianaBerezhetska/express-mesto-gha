const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;
const SALT_ROUNDS = 10;

const getUsers = (req, res, next) => {
  User.find({})
    .orFail(() => {
      throw new NotFoundError('Карточка с указанным _id не найдена.');
    })
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => {
      next(err);
    });
};

const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден.');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден.');
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
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
            next(new BadRequestError('Одно из полей заполнено неверно'));
          } else if (err.name === 'MongoServerError' && err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже существует'));
          } else {
            next(err);
          }
        });
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'encrypted-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

const updateUser = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, {
    name: req.body.name,
    about: req.body.about,
  }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден.');
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        if (err.errors.name) {
          next(new BadRequestError(err.errors.name.message));
        } else if (err.errors.about) {
          next(new BadRequestError(err.errors.about.message));
        } else {
          next(new BadRequestError('Одно из полей заполнено неверно'));
        }
      } else if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
      } else {
        next(err);
      }
    });
};

const updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, {
    avatar: req.body.avatar,
  }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден.');
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        if (err.errors.avatar) {
          next(new BadRequestError(err.errors.avatar.message));
        } else {
          next(new BadRequestError('Поле заполнено неверно'));
        }
      } else if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении аватара.'));
      } else {
        next(err);
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
