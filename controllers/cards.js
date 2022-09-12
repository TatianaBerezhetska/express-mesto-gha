const Card = require('../models/card');

const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

const getCards = (req, res, next) => {
  Card.find({})
    .orFail(() => {
      const error = new Error();
      error.statusCode = 404;
      throw error;
    })
    .then((cards) => res.send({ data: cards }))
    .catch(() => {
      next(new BadRequestError('Произошла ошибка.'));
    });
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        if (err.errors.name) {
          next(new BadRequestError(err.errors.name.message));
        } else if (err.errors.link) {
          next(new BadRequestError(err.errors.link.message));
        } else {
          next(new BadRequestError('Ошибка валидации'));
        }
      } else {
        next(err);
      }
    });
};

const deleteCard = (req, res, next) => {
  const currentUser = req.user._id;
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new NotFoundError('Карточка с указанным _id не найдена.');
    })
    .then((card) => {
      const cardOwner = card.owner;
      if (currentUser === cardOwner.toString()) {
        Card.findByIdAndRemove(req.params.cardId)
          .then(() => res.send({ data: card }));
      } else {
        throw new ForbiddenError('Удаление чужих карточек невозможно');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else if (err.statusCode === 404) {
        next(new NotFoundError('Карточка с указанным _id не найдена.'));
      } else {
        next(err);
      }
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Передан несуществующий _id карточки.');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка.'));
      } else if (err.statusCode === 400) {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка. '));
      } else if (err.statusCode === 404) {
        next(new NotFoundError('Передан несуществующий _id карточки.'));
      } else {
        next(err);
      }
    });
};

const dislikeCard = (req, res, next) => {
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
        next(new BadRequestError('Переданы некорректные данные для удаления лайка.'));
      } else if (err.statusCode === 400) {
        next(new BadRequestError('Переданы некорректные данные для удаления лайка. '));
      } else if (err.statusCode === 404) {
        next(new NotFoundError('Передан несуществующий _id карточки.'));
      } else {
        next(err);
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
