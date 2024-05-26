class APIResponse {
  constructor(statusCode, message = null, data) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export { APIResponse };
