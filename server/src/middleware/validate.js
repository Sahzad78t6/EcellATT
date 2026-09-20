import { ApiResponse } from '../utils/apiResponse.js';

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error.errors) {
        const errorDetails = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          data: null,
          message: errorDetails[0]?.message || 'Validation failed',
          error: errorDetails
        });
      }
      return ApiResponse.error(res, error.message || 'Validation failed', 400);
    }
  };
};
