export function errorHandler(err, req, res, next) {
  console.error('[Error Middleware]:', err);
  const status = err.status || err.statusCode || 500;
  const response = {
    message: err.message || 'Internal Server Error',
  };
  if (err.details) {
    response.details = err.details;
  }
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }
  res.status(status).json(response);
}
