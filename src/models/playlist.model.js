import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export const Playlist = mongoose.model('Playlist', playlistSchema);
