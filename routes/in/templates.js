var express = require('express');
var router = express.Router();

var db = require('../../db');

/* /in/templates router */

/* GET in. */
router.get('/', function(req, res, next) {
  var userId = req.user.id;
  var offset = req.query.offset || 0;
  db.getTemplates(userId, offset, function (err, templates) {
    if (err) return next(err);

    templates.forEach(function (template) {
      if (template.name && template.name.length > 25) {
        template.name = template.name.substring(0, 25) + '...';
      }
    });

    res.render('in/templates', {
      title: 'Express',
      templates: templates
    });
  });
});

/** 
 * This is an ajax route. update: no
 */
router.get('/new', function (req, res, next) {
  db.newTemplate(req.user.id, function (err, result) {
    if (err) return next(err);

    // console.log('res.redirect(result.insertId);', result.insertId);
    res.redirect(result.insertId);
  })
});

router.get('/:id', function(req, res, next) {
  var userId = req.user.id;
  var tempId = req.params.id;
  
  db.getTemplate(userId, tempId, function (err, template) {
    if (err) return next(err);

    res.render('in/template_edit', {
      template
    });
  });
});

/**
 * TODO Fix security
 */
router.post('/:id', function (req, res, next) {
  var userId = req.user.id;
  var tempId = req.params.id;
  var tName = req.body['template-name-field'];

  // console.log(req.body);
  db.pool.getConnection(function (err, conn) {
    if (err) return next(err);

    var q = 'update template set tname = ? where id = ? and (creator = ? or shared = true);';
    conn.query(q, [tName, tempId, userId], function (err, resp) {
      conn.release();
      if (err) return next(err);

      res.redirect(req.originalUrl);
    });
  });
});

router.get('/:id/content', function (req, res, next) {
  var userId = req.user.id;
  var tempId = req.params.id;

  db.getTemplate(userId, tempId, function (err, template) {
    if (err) return next(err);
    res.send(template.content);
  });
});

router.post('/:id/content', function (req, res, next) {
  var userId = req.user.id;
  var tempId = req.params.id;
  var content = req.body.content;

  db.setTemplateContent(userId, tempId, content, function (err, template) {
    // if (err) return next(err);
    if (err) throw err;
    res.status(200).end();
  });
});

module.exports = router;
