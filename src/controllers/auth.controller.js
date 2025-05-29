import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { apiResponse } from '../utils/responseHandler.js';
import { STATUS_CODES } from '../constants/api.js';

export const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return apiResponse(res, false, 'Email already registered', null, STATUS_CODES.CONFLICT);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = generateAccessToken(user._id);

    return apiResponse(
      res,
      true,
      'User registered successfully',
      { token, user: { id: user._id, username, email } },
      STATUS_CODES.CREATED
    )
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return apiResponse(res, false, 'User with email does not exist', null, STATUS_CODES.NOT_FOUND);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return apiResponse(res, false, 'Invalid credentials', null, STATUS_CODES.UNAUTHORIZED);

    const token = generateAccessToken(user._id);

    return apiResponse(
      res, 
      true, 
      'Login successful', 
      { token, user: { id: user._id, username: user.username, email: user.email } }
    );
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};