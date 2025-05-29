import Joi from 'joi';
import mongoose from 'mongoose';

const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const createPlaylistSchema = Joi.object({
  name: Joi.string().required().trim().max(100)
    .messages({
      'string.empty': 'Playlist name is required',
      'string.max': 'Playlist name cannot exceed 100 characters'
    }),
  description: Joi.string().allow('').max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
});

export const updatePlaylistSchema = Joi.object({
  name: Joi.string().trim().max(100)
    .messages({
      'string.max': 'Playlist name cannot exceed 100 characters'
    }),
  description: Joi.string().allow('').max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
});

export const playlistIdSchema = Joi.object({
  id: Joi.string().custom(validateObjectId, 'MongoDB ObjectId validation')
    .required()
    .messages({
      'any.required': 'Playlist ID is required',
      'any.invalid': 'Invalid playlist ID format'
    }),
});

