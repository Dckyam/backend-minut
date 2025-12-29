/**
 * Async handler untuk wrap async functions di routes
 * Menghindari try-catch berulang di setiap controller
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
