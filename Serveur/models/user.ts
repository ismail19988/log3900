import mongoose from 'mongoose'
import { IUser } from '../interfaces/user';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required : true,
        unique : true
    },
    password: {
        type: String,
        required : true
    },
    firstname: {
        type: String,
        required : true
    },
    lastname: {
        type: String,
        required : true
    },
    username: {
        type: String,
        required : true
    },
    avatar: {
        type: String,
        required : true
    },
    lastConnection: {
        type: [],
        required : true
    },
    LastDeconnection: {
        type: [],
        required : true
    },
    historiqueEdition: {
        type: [],
        required: true
    },
    collaborations: {
        type: [],
        required: true
    },
    ownership: {
        type: [],
        required: true
    },
    teams: {
        type: [],
        required: true
    },
    totalTimeCollab: {
        type: Number,
        required: true
    },
    isNamePublic: {
        type: Boolean,
        required: true
    },
    isEmailPublic: {
        type: Boolean,
        required: true
    },
    lastAction: {
        type: [],
        required: true
    }

})

export =  mongoose.model<IUser>('UserSchema', userSchema);