import { STATUS_CODES } from '../constants/api.js';
import { Playlist } from '../models/playlist.model.js';
import { apiResponse } from '../utils/responseHandler.js';

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const playlist = await Playlist.create({
      name,
      description,
      user: req.userId,
      songs: [],
    });
    return apiResponse(res, true, 'Playlist created successfully!', playlist, STATUS_CODES.CREATED);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.userId }).populate('songs');
    if (!playlists || playlists.length === 0) {
      return apiResponse(res, true, 'No playlists found!', [], STATUS_CODES.OK);
    }
    return apiResponse(res, true, 'Playlists retrieved successfully!', playlists, STATUS_CODES.OK);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.userId }).populate('songs');
    if (!playlist) return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);
    return apiResponse(res, true, 'Playlist retrieved successfully!', playlist, STATUS_CODES.OK);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, description, updatedAt: Date.now() },
      { new: true }
    );
    if (!playlist) return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);
    return apiResponse(res, true, 'Playlist updated successfully!', playlist, STATUS_CODES.OK);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!playlist) return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);
    return apiResponse(res, true, 'Playlist deleted successfully!', null, STATUS_CODES.OK);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
