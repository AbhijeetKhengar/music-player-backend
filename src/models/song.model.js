import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
    {
        spotifyId: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        artist: { type: String, required: true },
        album: { type: String },
        albumArt: { type: String },
        duration: { type: Number },
        previewUrl: { type: String },
        addedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export const Song = mongoose.model('Song', songSchema);
