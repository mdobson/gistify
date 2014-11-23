var github = require('github');
var identity = require('./client_identity.json');

function globalCb(err) {
  if(err) {
    console.log(err)
  }
}

function Gistify() {
  this._github = new github({
    version: '3.0.0'
  });
};

Gistify.prototype.authenticate = function(username, password, twoFactorOpts, cb) {
  if(!cb) {
    cb = globalCb;
  }

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

Gistify.prototype.authenticateToken = function(token, cb) {
  if(!cb) {
    cb = globalCb;
  }
  this._github.authenticate({
    type:'oauth',
    token: token
  });

  cb(null, true);
};

Gistify.prototype.create = function(description, public, files, cb) {
  if(!cb) {
    cb = globalCb;
  }
  var opts = {
    description: description,
    public: public,
    files: files
  }

  this._github.gists.create(opts, function(err, res) {
    if(err) {
      cb(err);
    } else {
      cb(null, true);
    }
  })
};

module.exports = new Gistify();
