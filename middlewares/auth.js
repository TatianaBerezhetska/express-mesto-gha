const jwt = require('jsonwebtoken');
const { ERR_UNAUTHORIZED } = require('../utils/errorCodes');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(ERR_UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'encrypted-key');
  } catch (err) {
    res.status(ERR_UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }

  req.user = payload;
  next();
};
