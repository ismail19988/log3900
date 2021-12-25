import mongoose from 'mongoose'
import { IRoomDB } from '../interfaces/chat/room';
import { ITeamDB } from '../interfaces/team';

const teamSchema = new mongoose.Schema({
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
    maxUsers: {
        type: Number,
        required: false
    },
    users: {
        type: [],
        required: true
    },
    bio: {
        type: String,
        required: true
    }
});

export =  mongoose.model<ITeamDB>('TeamSchema', teamSchema);