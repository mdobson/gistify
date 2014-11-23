# Gistify

Create gists easily.

## Usage

### JavaScript

```javascript
var Gistify = require('gistify');

Gistify.authenticate(username, password, function(err) {
  if(err) {
    console.log('Error authenticating');
    console.log(err);
  } else {
    //authenticated successfully

    Gistify.create('Test Gist', true, {'test.js': { 'content': 'console.log("hello");'}}, function(err) {
      if(err) {
        console.log('Error creating gist');
      } else {
        console.log('Gist created successfully');
      }
    });
  }
});
```

### Shell

```shell
$ gistify <dir|file>
```

