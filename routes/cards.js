const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const urlRegExp = require('../utils/RegExp');
const validateId = require('../utils/validateId');

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const checkCardId = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().custom(validateId, 'custom validation'),
  }),
});

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(urlRegExp),
  }),
}), createCard);

router.delete('/:cardId', checkCardId, deleteCard);
router.put('/:cardId/likes', checkCardId, likeCard);
router.delete('/:cardId/likes', checkCardId, dislikeCard);

module.exports = router;
