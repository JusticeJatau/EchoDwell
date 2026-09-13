export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ message: error.message || "Something went wrong", ...(process.env.NODE_ENV === "development" && { stack: error.stack }) });
}
