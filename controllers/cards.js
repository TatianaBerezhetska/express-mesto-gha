const Card = require('../models/card');
const {
  ERR_BAD_REQUEST,
  ERR_NOT_FOUND,
  ERR_SERVER_ERROR,
} = require('../utils/errorCodes');

const getCards = (req, res) => {
  Card.find({})
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((cards) => res.send({ data: cards }))
    .catch(() => {
      res.send({ message: 'Произошла ошибка.' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        if (err.errors.name) {
          res.status(ERR_BAD_REQUEST).send({ message: err.errors.name.message });
        } else if (err.errors.link) {
          res.status(ERR_BAD_REQUEST).send({ message: err.errors.link.message });
        } else {
          res.status(ERR_BAD_REQUEST).send({ message: 'Ошибка валидации' });
        }
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
      } else if (err.statusCode === 404) {
        res.status(ERR_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      } else if (err.statusCode === 400) {
        res.send({ message: 'Переданы некорректные данные для постановки лайка. ' });
      } else if (err.statusCode === 404) {
        res.status(ERR_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки.' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      } else if (err.statusCode === 400) {
        res.send({ message: 'Переданы некорректные данные для снятия лайка. ' });
      } else if (err.statusCode === 404) {
        res.status(ERR_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки.' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Произошла ошибка.' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
