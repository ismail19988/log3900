import mongoose from 'mongoose'
import { IDrawingDB, version } from '../interfaces/drawing/drawing'
import { VectorObject } from '../interfaces/drawing/vectorObject';

const drawingVersionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    versions: {
        type: [],
        required: true
    }

});

export = mongoose.model<version>('drawingVersionSchema', drawingVersionSchema);