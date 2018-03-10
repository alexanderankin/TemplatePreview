var express = require('express');
var router = express.Router();

var db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  var userId = req.signedCookies.userId;
  if (userId == undefined) {
    return res.render('login', { title: 'Express', error: req.query.error });
  }

  res.redirect('/in');
});

router.post('/login', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  db.login(username, password, function (err, id) {
    if (err) return next(err);

    // console.log("id returned to login fn as", id);
    if (id == undefined) {
      return res.redirect('/login?error=true');
    }

    res.cookie('userId', id.id, {
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 5,  // 5 hr
      signed: true
    });

    res.redirect('/in');
  });
});

router.get('/logout', function (req, res, next) {
  res.clearCookie('userId', {
    httpOnly: false,
    signed: true    
  });
  res.redirect('/?loggedout=true');
});

/* GET in. Shouldn't this have protective MW? */
router.use('/in', function (req, res, next) {
  req.user = {
    id: req.signedCookies.userId
  };
  res.locals.url = req.originalUrl;
  // console.log("User identified:", req.user);
  // console.log("Req URL identxd:", res.locals.url);

  if (!req.user.id) {
    // console.log("undefined request");
    return res.status(403).end();
  }

  next();
}, require('./in'));

module.exports = router;
