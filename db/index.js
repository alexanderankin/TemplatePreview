var mysql = require('mysql');
var crypto = require('crypto');
var md5 = require('md5');

var pool = mysql.createPool({
  host     : process.env['db_host'] || 'localhost',
  user     : process.env['db_name'] || 'me',
  password : process.env['db_pass'] || 'secret',
  database : process.env['db_db']   || 'my_db'
});

function random(done) {
  crypto.randomBytes(24, function(err, buffer) {
    if (err) return done(err); done(null, buffer.toString('hex'));
  });
}

function newTemplate(userId, done) {
  random(function (err, name) {
    if (err) return done(err);

    pool.getConnection(function (err, conn) {
      if (err) return done(err);

      var q = 'insert into template (tname, creator) values (?, ?)';
      conn.query(q, [name, userId], function (err, result) {
        conn.release();
        if (err) return done(err);

        done(null, result);
      });
    });
  });
}

function hashPassword(password) {
  return md5(password + (process.env['pwd_hash'] || 'keyboard cat'));
}

/**
 * undefined is not found
 */
function login(uname, pword, done) {
  var passwordHash = hashPassword(pword);
  pool.getConnection(function (err, conn) {
    if (err) return done(err);

    var q = "select * from user where username = ? and passwordhash = ?;";
    conn.query(q, [uname, passwordHash], function (err, res) {
      conn.release();
      if (err) return done(err);

      return done(null, res && res[0]);
    });
  });
}

function insertAdminUser(done) {
  var aPH = hashPassword(process.env['admin_pwd'] || "pwd");
  var a = { un: "admin", n: "Administrator" };
  pool.getConnection(function (err, conn) {
    if (err) return done(err);

    var q = "insert into user (id, username, name, passwordhash) "
      + "values (?, ?, ?, ?) on duplicate key update "
      + "username = ?, name = ?, passwordhash = ?;";

    conn.query(q, [1, a.un, a.n, aPH, a.un, a.n, aPH], function (err, res) {
      conn.release();
      if (err) return done(err);

      done(null);
    });
  });
}
insertAdminUser((err) => { if(err) throw err; console.log("Admin user inserted."); });

function insertUser(username, password, done) {
  var passwordHash = hashPassword(password);
  pool.getConnection(function (err, conn) {
    if (err) return done(err);

    var q = "insert into user (username, passwordhash) values (?, ?);";
    conn.query(q, [username, passwordHash], function (err) {
      conn.release();
      if (err) { return done(err); } done(null);
    });
  });
}

function getTemplates(userId, offset, done) {
  pool.getConnection(function (err, conn) {
    if (err) return done(err);

    var q = 'select * from template where creator = ? or shared = true limit 10 offset ?';
    conn.query(q, [userId, offset], function (err, rows) {
      conn.release();
      if (err) return done(err);

      return done(null, rows);
    });
  });
}

function getTemplate(userId, templateId, done) {
  var q = 'select * from template where (creator = ? or shared = true) and id = ?;';
  pool.getConnection(function (err, conn) {
    if (err) return done(err);

    conn.query(q, [userId, templateId], function (err, result) {
      conn.release();
      if (err) return done(err);

      done(null, result[0]);
    });
  });
}

function setTemplateContent(userId, templateId, content, done) {
  var q = 'update template set content = ? where (creator = ? or shared = true) and id = ?;';
  pool.getConnection(function (err, conn) {
    if (err) return done(err);

    // console.log(mysql.format(q, [content, userId, templateId]));
    conn.query(q, [content, userId, templateId], function (err, result) {
      conn.release();
      if (err) return done(err);

      done(null);
    });
  });
}

function getDownloads(userId, offset, done) {
  pool.getConnection(function (err, conn) {
    if (err) return done(err);

    // var q = 'select * from prints where (creator = ? or shared = true) limit 10 offset ?;';
    // var q = 'select * from prints join user on user.id = prints.creator where (creator = ? or shared = true) limit 10 offset ?;';
    var q = 'select prints.id as pid, prints.filename, user.name as creator, template.tname as template, template.id as tid from prints join user on user.id = prints.creator join template on template.id = prints.template where (prints.creator = ? or prints.shared = true) limit 10 offset ?;';
    // console.log(mysql.format(q, [userId, offset]))
    conn.query(q, [userId, offset], function (err, rows) {
      conn.release();
      if (err) return done(err);

      done(null, rows);
    });
  });
}

function newDownload(fName, userId, shared, templateId, done) {
  pool.getConnection(function (err, conn) {
    if (err) return done(err);

    var q = 'insert into prints (filename, creator, shared, template) values (?, ?, ?, ?);';
    conn.query(q, [fName, userId, shared, templateId], function (err, res) {
      conn.release();
      if (err) return done(err);

      done(null, res);
    });
  });
}

module.exports = {
  getTemplates, login, newTemplate, getTemplate, insertAdminUser, insertUser, pool, setTemplateContent,
  getDownloads, random, newDownload
};
