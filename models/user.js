const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const urlRegExp = require('../utils/RegExp');
const UnauthorizedError = require('../errors/unauthorized-err');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Укажите почту в верном формате',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле "Пароль" является обязательным'],
    select: false,
  },
  name: {
    type: String,
    minlength: [2, 'Введите в поле "Имя" не менее 2-х символов'],
    maxlength: [30, 'Введите в поле "Имя" не более 30-ти символов'],
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: [2, 'Введите в поле "О себе" не менее 2-х символов'],
    maxlength: [30, 'Введите в поле "О себе" не более 30-ти символов'],
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (avatar) => urlRegExp.test(avatar),
      message: 'Введите ссылку в верном формате',
    },
  },
});

userSchema.index({ email: 1 }, { unique: true });

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizedError('Неправильные почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
