const path = require('path');
const express = require('express');

require('dotenv').config();
require('express-async-errors');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));

app.use(require('./routers'));

app.use((err, req, res, next) => {
  console.log('Error handler desu::::', err);

  return res.render('error', { err });
});

app.listen(process.env.NODE_PORT, () => {
  console.log('Hello world from port ', process.env.NODE_PORT);
});
