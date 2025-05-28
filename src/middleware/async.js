/**
 * Async handler to wrap async route handlers and catch errors
 * @param {Function} fn The async function to wrap
 * @returns {Function} Middleware function
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler; 