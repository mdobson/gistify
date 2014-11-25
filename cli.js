#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var path = require('path');
var gistify = require('./');
var configPath = path.join(process.env.HOME, '.gistify');
var colors = require('colors');
var description = 'Created with Gistify';
var pub = true;

colors.setTheme({
  error: 'red',
  info: 'cyan'
});

if(fs.existsSync(configPath)) {
  var json = JSON.parse(fs.readFileSync(configPath));
  var token = json.token;
  gistify.authenticateToken(token, function(err) {
    if(err) {
      console.log('Error authenticating current token ' + token + ' you should probably refresh it.'.error);
    }
  });
}

program
  .option('--description <desc>')
  .option('--private')
  .version('0.0.1');

function gistifyFile(description, pub, file) {
  if(Array.isArray(file)) {
    var obj = {};
    file.forEach(function(f) {
      var base = path.basename(f);
      console.log('[Gistify] -- Gistifying file: ' + base.info);
      var data = fs.readFileSync(f);
      obj[base] = { 'content': data.toString() };
    });
    gistify.create(description, pub, obj);
  } else {

    console.log('[Gistify] -- Gistifying file: ' + file.info);
    fs.readFile(file, function(err, data) {
      if(err) {
        console.log('Error reading file. ' + err.error);
      } else {
        var base = path.basename(file);
        var obj = {};
        obj[base] = {'content': data.toString()};
        gistify.create(description, pub, obj);
      }
    });
  }
}

program
  .command('login <username> <password>')
  .description('Login to github. Post gists on your behalf.')
  .action(function(username, password) {
    gistify.authenticate(username, password, {}, function(err, token) {
      if(err) {
        console.log('Authentication Error. ' + err.error);
      } else {
        console.log('[Gistify] -- Writing access token ' + token + ' to .gistify in home directory'.info);
        fs.writeFile(configPath, JSON.stringify({ token: token }), function(err) {
          if(err) {
            console.log('Oops! Looks like the token wasn\'t saved. Error: ' + err.error);
          } else {
            console.log('[Gistify] -- Token saved!');
          }
        });
      }
    });
  });

program
  .command('gist <file>')
  .description('Create a new gist from a file or directory.')
  .action(function(file) {
    var currentPath = path.join(process.cwd(), file);
    fs.stat(currentPath, function(err, stat) {
      if(typeof program.description !== 'function') {
        description = program.description;
      }

      if(program.private) {
        pub = false;
      }

      if(err) {
        console.log('Error accessing path. ' + err.error);
      } else {
        if(stat.isFile()) {
          console.log('[Gistify] -- Accessing file'.info);
          gistifyFile(description, pub, currentPath);
        } else if(stat.isDirectory()) {
          console.log('[Gistify] -- Accessing directory'.info);
          fs.readdir(currentPath, function(err, files) {
            if(err) {
              console.log('Error reading files. ' + err.error);
            } else {
              files = files.map(function(file) {
                return path.join(currentPath, file);
              });

              gistifyFile(description, pub, files);
            }
          });
        }
      }
    });
  });

program
  .parse(process.argv);
