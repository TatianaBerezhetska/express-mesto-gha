const options = {
  origin: [
    'https://localhost:3010',
    'http://localhost:3010',
    'https://berezhetska.students.nomoredomains.sbs',
    'http://berezhetska.students.nomoredomains.sbs',
    'https://TatianaBerezhetska.github.io',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

module.exports = options;
