import mongoose from 'mongoose'
import { IDrawingDB } from '../interfaces/drawing/drawing'

const drawingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    owner: {
        type: String,
        required: true
    },
    creationTimestamp: {
        type: Number,
        required: true
    },
    privacy: {
        type: String,
        required: true,
        enum : ['public', 'protected', 'private'],
        default: 'public'
    },
    objects: {
        type: [],
        required: true
    },
    // TODO changer a true
    preview: {
        type: String,
        required: false
    },
    team: {
        type: String,
        required: false
    },
    version: {
        type: Number,
        required: true
    },
    versions: {
        type: Number,
        required: true
    },
    z: {
        type: Number,
        required: true
    }
});

export = mongoose.model<IDrawingDB>('DrawingSchema', drawingSchema)