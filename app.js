const express = require('express');

const { PORT = 3000 } = process.env;

const app = express();
const mongoose = require('mongoose');
const { login, createUser } = require('./controllers/user');
const userRouter = require('./routes/user');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const { ERR_NOT_FOUND } = require('./utils/errorCodes');

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());

app.post('/signin', login);
app.post('/signup', createUser);

app.use('/users', auth, userRouter);
app.use('/cards', auth, cardsRouter);

app.use((req, res) => {
  res.status(ERR_NOT_FOUND).send({ message: 'Страница по указанному маршруту не найдена' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
