const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Поле "Имя" является обязательным'],
    minlength: [2, 'Введите в поле "Имя" не менее 2-х символов'],
    maxlength: [30, 'Введите в поле "Имя" не более 30-ти символов'],
  },
  about: {
    type: String,
    required: [true, 'Поле "О себе" является обязательным'],
    minlength: [2, 'Введите в поле "О себе" не менее 2-х символов'],
    maxlength: [30, 'Введите в поле "О себе" не более 30-ти символов'],
  },
  avatar: {
    type: String,
    required: [true, 'Поле "Аватар" является обязательным'],
  },
});

module.exports = mongoose.model('user', userSchema);
