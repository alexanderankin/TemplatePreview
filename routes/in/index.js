var express = require('express');
var router = express.Router();

var path = require('path');

var db = require('../../db');

/* /in router */

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('in/home', { title: 'Express' });
});

router.use('/templates', require('./templates'));
router.use('/downloads', require('./downloads'));

var dataDir = path.join(__dirname, '..', '..', 'data');
router.use('/files', express.static(dataDir));

module.exports = router;
