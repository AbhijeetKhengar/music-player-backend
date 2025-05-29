import Joi from 'joi';
import mongoose from 'mongoose';

const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const playlistIdParamSchema = Joi.object({
  playlistId: Joi.string().custom(validateObjectId, 'MongoDB ObjectId validation')
    .required()
    .messages({
      'any.required': 'Playlist ID is required',
      'any.invalid': 'Invalid playlist ID format'
    }),
});

export const songIdParamSchema = Joi.object({
  playlistId: Joi.string().custom(validateObjectId, 'MongoDB ObjectId validation')
    .required()
    .messages({
      'any.required': 'Playlist ID is required',
      'any.invalid': 'Invalid playlist ID format'
    }),
  songId: Joi.string().custom(validateObjectId, 'MongoDB ObjectId validation')
    .required()
    .messages({
      'any.required': 'Song ID is required',
      'any.invalid': 'Invalid song ID format'
    }),
});

export const addSongSchema = Joi.object({
  spotifyId: Joi.string().required()
    .messages({
      'string.empty': 'Spotify ID is required',
      'any.required': 'Spotify ID is required'
    }),
  title: Joi.string().required().trim().max(200)
    .messages({
      'string.empty': 'Song title is required',
      'string.max': 'Song title cannot exceed 200 characters'
    }),
  artist: Joi.string().required().trim().max(200)
    .messages({
      'string.empty': 'Artist name is required',
      'string.max': 'Artist name cannot exceed 200 characters'
    }),
  album: Joi.string().allow('').max(200)
    .messages({
      'string.max': 'Album name cannot exceed 200 characters'
    }),
  albumArt: Joi.string().uri().allow('')
    .messages({
      'string.uri': 'Album art must be a valid URL'
    }),
  duration: Joi.number().integer().min(0)
    .messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be an integer',
      'number.min': 'Duration cannot be negative'
    }),
  previewUrl: Joi.string().uri().allow('')
    .messages({
      'string.uri': 'Preview URL must be a valid URL'
    }),
});
