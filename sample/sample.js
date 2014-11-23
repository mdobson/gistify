var Gistify = require('./');
var username = process.env.USERNAME;
var password = process.env.PASS;
Gistify.authenticate(username, password, {}, function(err, token) {
});
Gistify.create('Test Gist', true, {'test.js': { 'content': 'console.log("hello");'}}, function(err, created) {
  console.log(arguments);
});
