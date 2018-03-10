var express = require('express');
var router = express.Router();

var db = require('../../db');
var lib = require('../../lib');

/* /in/downloads router */

/* GET in. */
router.get('/', function(req, res, next) {
  var userId = req.user.id;
  var offset = req.query.offset || 0;
  db.getDownloads(userId, offset, function (err, downloads) {
    if (err) return next(err);
    // if (err) throw err;

    downloads.forEach(function (download) {
      var t = download.template;
      if (t && t.length > 25) {
        download.template = t.substr(0, 5) + ' ... ' + t.substr(-5, 5);
      }
    });
    // console.log(downloads)

    res.render('in/downloads', {
      title: 'Express',
      downloads: downloads,
      templateSelected: req.query.templateId ? true : false,
      templateId: req.query.templateId || 'null'
    });
  });
});

/** 
 * This is an ajax route.
 */
router.post('/new', function (req, res, next) {
  var creator = req.user.id;
  var data = req.body.data;
  var templateId = req.body.templateId;

  db.random(function (err, randomString) {
    if (err) return next(err);
    var fileName = randomString + ".pdf";

    /*console.log("I need to take data", data,
      "combine it with the template", templateId,
      "producing the file", fileName);*/
    db.getTemplate(creator, templateId, function (err, template) {
      if (err) return next(err);

      lib.render(data, template.content, fileName, function (err) {
        if (err) return next(err);

        // https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.428/pdf.js
        res.json({ fileName });

        db.newDownload(fileName, creator, false, templateId, function (err) {
          if (err) console.log(err);
          /*console.log("file is accessible at",
            'http://localhost:3000/in/files/' + fileName);*/
        });
      });
    });
  });
}, function (err, req, res, next) {
  // throw err;
  res.json({
    message: err.message,
    err: req.app.get('env') === 'development' ? err : {}
  });
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
