'use strict'

// Used with quick-and-dirty global error handler in app.js
// Thanks to http://thecodebarbarian.com/80-20-guide-to-express-error-handling.html
function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}

module.exports = {
  wrapAsync
};