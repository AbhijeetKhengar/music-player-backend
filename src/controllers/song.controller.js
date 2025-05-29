import { STATUS_CODES } from '../constants/api.js';
import { Playlist } from '../models/playlist.model.js';
import { Song } from '../models/song.model.js';
import { apiResponse } from '../utils/responseHandler.js';

export const addSongToPlaylist = async (req, res) => {
  try {
    const { spotifyId, title, artist, album, albumArt, duration, previewUrl } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.playlistId, user: req.userId });
    if (!playlist) return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);

    // Check if song exists
    let song = await Song.findOne({ spotifyId });
    if (!song) {
      song = await Song.create({ spotifyId, title, artist, album, albumArt, duration, previewUrl });
    }

    // Prevent duplicate songs in playlist
    if (playlist.songs.includes(song._id)) {
      return apiResponse(res, false, 'Song already in playlist', null, STATUS_CODES.CONFLICT);
    }

    playlist.songs.push(song._id);
    await playlist.save();

    return apiResponse(res, true, 'Song added to playlist successfully!', playlist, STATUS_CODES.CREATED);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.playlistId, user: req.userId });
    if (!playlist) return apiResponse(res, false, 'Playlist not found', null, STATUS_CODES.NOT_FOUND);

    playlist.songs = playlist.songs.filter(
      songId => songId.toString() !== req.params.songId
    );
    await playlist.save();

    return apiResponse(res, true, 'Song removed from playlist successfully!', playlist, STATUS_CODES.OK);
  } catch (err) {
    return apiResponse(res, false, 'Server error: ' + err.message, null, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
