const express = require('express');
const { restart } = require('nodemon');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('server is up and running');
});

module.exports = router;