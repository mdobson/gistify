#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var path = require('path');
var gistify = require('./');
var configPath = path.join(process.env.HOME, '.gistify');
var description = 'Created with Gistify';
var pub = true;

if(fs.existsSync(configPath)) {
  var json = JSON.parse(fs.readFileSync(configPath));
  var token = json.token;
  gistify.authenticateToken(token, function(err) {
    if(err) {
      console.log('Error authenticating current token ' + token + ' you should probably refresh it.');
    }
  });
}

program
  .option('--description <desc>')
  .option('--private')
  .version('0.0.1');

function gistifyFile(description, pub, file) {
  console.log('Gistifying file: ' + file);
  if(Array.isArray(file)) {
    var obj = {};
    file.forEach(function(f) {
      var base = path.basename(f);
      var data = fs.readFileSync(f);
      obj[base] = { 'content': data.toString() };
    });
    gistify.create(description, pub, obj);
  } else {
    fs.readFile(file, function(err, data) {
      if(err) {
        console.log('Error reading file. ' + err);
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
  .action(function(username, password) {
    gistify.authenticate(username, password, {}, function(err, token) {
      if(err) {
        console.log('Authentication Error. ' + err);
      } else {
        console.log('Writing access token ' + token + ' to .gistify in home directory');
        fs.writeFile(configPath, JSON.stringify({ token: token }), function(err) {
          if(err) {
            console.log('Oops! Looks like the token wasn\'t saved. Error: ' + err);
          } else {
            console.log('Token saved!');
          }
        });
      }
    });
  });

program
  .command('gist <file>')
  .action(function(file) {
    var currentPath = path.join(process.cwd(), file);
    fs.stat(currentPath, function(err, stat) {
      
      if(program.description) {
        description = program.description;
      }

      if(program.private) {
        pub = false;
      }

      if(err) {
        console.log('Error accessing path. ' + err);
      } else {
        if(stat.isFile()) {
          console.log('Accessing file');
          //gistifyFile(description, pub, currentPath);
        } else if(stat.isDirectory()) {
          console.log('Accessing directory');
          fs.readdir(currentPath, function(err, files) {
            if(err) {
              console.log('Error reading files. ' + err);
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
