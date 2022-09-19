const mongoose = require('mongoose');
const validator = require('validator');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Введите название места'],
    minlength: [2, 'Название места должно содержать не менее 2-х символов'],
    maxlength: [30, 'Название места должно содержать не более 30-ти символов'],
  },
  link: {
    type: String,
    required: [true, 'Добавьте ссылку на фото'],
    validate: {
      validator: (link) => validator.isURL(link),
      message: 'Укажите ссылку на фото',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: [],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
