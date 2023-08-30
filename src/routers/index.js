const { Router } = require('express');

const router = Router();

const dashboardRouter = require('./dashboard.router');
router.use('/dashboard', dashboardRouter);

router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

module.exports = router;
