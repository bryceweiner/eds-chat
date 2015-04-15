'use strict';

const debug     = require('debug')('chat:app');

import koa        from 'koa';
import path       from 'path';
import config     from '../config';

export const app = koa();

// What does the 'dev' do here?
app.use(require('koa-logger')('dev'));
// Serve static files.
app.use(require('koa-static')(path.join(__dirname, '../public')));

// Catch all exceptions.
app.use(function *(next){
  try {
    yield next;
  } catch (err) {
    // some errors will have .status however this is not a guarantee
    this.status = err.status || 500;
    this.type   = 'html';
    this.body   = '<p>Something <em>exploded</em>, please contact Edwin.</p>';

    // since we handled this manually we'll want to delegate to the
    // regular app level error handling as well so that centralized
    // still functions correctly.
    this.app.emit('error', err, this);
  }
});

app.use(function *pageNotFound(next){
  yield next;

  if (404 != this.status) return;

  // we need to explicitly set 404 here so that koa doesn't assign 200
  // on body=
  this.status = 404;

  switch (this.accepts('html', 'json')) {
    case 'html':
      this.type = 'html';
      this.body = '<p>Page Not Found</p>';
      break;
    case 'json':
      this.body = {
        message: 'Page Not Found'
      };
      break;
    default:
      this.type = 'text';
      this.body = 'Page Not Found';
  }
});

app.on('error', function(err){
  if (config.base.ENV != 'test') {
    console.log('sent error %s to the cloud', err.message);
    console.log(err);
  }
});

// Start the server
export const httpServer =
  app.listen(config.http.PORT, function () {
    console.log('Vault chat %s listening at port %d',
          config.base.VERSION,
          config.http.PORT);
  });
