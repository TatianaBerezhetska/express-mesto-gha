const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.send({ message: 'Переданы некорректные данные.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
      }
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
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
      if (err.statusCode === 404) {
        res.send({ message: 'Карточка с указанным _id не найдена.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
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
      if (err.statusCode === 400) {
        res.send({ message: 'Переданы некорректные данные для постановки лайка. ' });
      } else if (err.statusCode === 404) {
        res.send({ message: 'Передан несуществующий _id карточки.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
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
      if (err.statusCode === 400) {
        res.send({ message: 'Переданы некорректные данные для снятия лайка. ' });
      } else if (err.statusCode === 404) {
        res.send({ message: 'Передан несуществующий _id карточки.' });
      } else {
        res.send({ message: `Произошла ошибка ${err}.` });
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
