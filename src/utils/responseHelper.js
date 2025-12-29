/**
 * Format response sukses
 */
const successResponse = (data, message = 'Success', meta = {}) => {
  return {
    success: true,
    message,
    ...meta,
    data,
  };
};

/**
 * Format response error
 */
const errorResponse = (message = 'Error occurred', error = null) => {
  const response = {
    success: false,
    message,
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return response;
};

/**
 * Format validation error
 */
const validationErrorResponse = (errors) => {
  return {
    success: false,
    message: 'Validation error',
    errors,
  };
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
};
