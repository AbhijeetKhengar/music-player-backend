import { STATUS_CODES } from "../constants/api.js";

/**
 *  API response handler
 * @param {object} res - Express response object
 * @param {boolean} success - Whether the request was successful
 * @param {string} message - Response message
 * @param {object|array|null} data - Response data (optional)
 * @param {number} statusCode - HTTP status code
 * @returns {object} Express response
 */
export const apiResponse = (res, success, message, data = null, statusCode = STATUS_CODES.OK) => {
  const response = {
    status: success ? 'success' : 'failure',
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
