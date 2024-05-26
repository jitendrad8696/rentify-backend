class APIError extends Error {
  constructor(
    statusCode = 500,
    message = "Internal Server Error",
    details = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.details = details;
    if (!this.stack) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { APIError };
