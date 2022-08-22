const express = require('express');

const { PORT = 3000 } = process.env;

const app = express();
const mongoose = require('mongoose');
const userRouter = require('./routes/user');
const cardsRouter = require('./routes/cards');
const { ERR_NOT_FOUND } = require('./utils/errorCodes');

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '62fbe80d420448eadf90db4c',
  };

  next();
});

app.use('/users', userRouter);
app.use('/cards', cardsRouter);

app.use((req, res) => {
  res.status(ERR_NOT_FOUND).send({ message: 'Страница по указанному маршруту не найдена' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
