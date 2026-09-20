export class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      error: null
    });
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(res, message = 'Internal server error', statusCode = 500, error = null) {
    return res.status(statusCode).json({
      success: false,
      data: null,
      message,
      error: error || message
    });
  }
}
