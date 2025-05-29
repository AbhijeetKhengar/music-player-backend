import { STATUS_CODES } from '../constants/api.js';
import { User } from '../models/user.model.js';
import { apiResponse } from '../utils/responseHandler.js';

export const getById = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return apiResponse(res, false, 'User not found', null, STATUS_CODES.NOT_FOUND);

    return apiResponse(res, true, 'User retrieved successfully', user, STATUS_CODES.OK);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
