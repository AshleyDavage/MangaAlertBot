import mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "Comic title is required."],
        unique: true
    },
    latestChapter: {
        type: String,
        trim: true
    },
    imageURL: {
        type: String
    },
    description: {
        type: String,
        trim: true
    },
    author: {
        type: String,
        trim: true
    },
    channels: {
        type: [String]
    },
    slug: {
        type: String,
    },
    hid:{
        type: String,
        required: [true, "Comic hid is required."],
    }
});

export interface IComic extends mongoose.Document {
    title: string;
    latestChapter?: string;
    imageURL?: string;
    description?: string;
    author?: string;
    channels?: string[];
    slug?: string;
    hid: string;
}

export const Comic = mongoose.model('Comic', comicSchema);