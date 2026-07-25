/**
 * Wrapper pour éviter les try/catch répétitifs dans les controllers async.
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { asyncHandler };
