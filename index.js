var github = require('github');
var identity = require('./client_identity.json');

function Gistify() {
  this._github = new github({
    version: '3.0.0'
  });
};

Gistify.prototype.authenticate = function(username, password, twoFactorOpts, cb) {
  this._github.authenticate({
    type: 'basic',
    username: username,
    password: password
  });
  var headers = {};

  if(twoFactorOpts) {
    headers['X-GitHub-OTP'] = twoFactorOpts.password;
  }

  this._github.authorization.create({
    scopes: ['gist'],
    note: 'This is for gistify',
    note_url: 'http://mdobson.github.io/',
    client_id: identity.client_id,
    client_secret: identity.client_secret,
    headers: headers
  }, function(err, res) {
    if(err) {
      cb(err)
    }
    if(res && res.token) {
      cb(null, res.token);
    }
  });
};

Gistify.prototype.create = function(description, public, files, cb) {
  var opts = {
    description: description,
    public: public,
    files: files
  }

  console.log(opts);
  this._github.gists.create(opts, function(err, res) {
    if(err) {
      cb(err);
    } else {
      cb(true);
    }
  })
};

module.exports = new Gistify();
