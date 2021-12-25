import mongoose from 'mongoose'
import { IRoomDB } from '../interfaces/chat/room';

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true,
        unique : true
    },
    password: {
        type: String,
        required : false
    },
    owner: {
        type: String,
        required : true
    },
    history: {
        type: [],
        required:false
    },
    users: {
        type: [],
        required:true
    }

});

export =  mongoose.model<IRoomDB>('RoomSchema', roomSchema);