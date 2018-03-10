var fs = require('fs');
var path = require('path');
var Liquid = require('liquidjs');
var wkhtmltopdf = require('wkhtmltopdf');

var engine = Liquid();
var dataDir = path.join(__dirname, '..')

function htmlToPdf(string, fileName, done) {
  var fullPath = path.join(__dirname, '..', 'data', fileName);

  wkhtmltopdf(string)
    .pipe(fs.createWriteStream(fullPath))
    .on('finish', function() { done(null); })
    .on('error', function(e) { done(e); });
}

function render(locals, string, fileName, done) {
  htmlRender(locals, string, function (err, htmlString) {
    if (err) return done(err);

    htmlToPdf(htmlString, fileName, done);
  });
}

function htmlRender(locals, string, done) {
  // console.log("rendering with locals", locals, "template", string);
  engine.parseAndRender(string, locals)
    .then(function (htmlString) {
      done(null, htmlString);
    })
    .catch(function (err) {
      done(err);
    });
}

module.exports = {
  htmlToPdf, htmlRender, render
};
