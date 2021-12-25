import config from '../config/config';
import mongoose from 'mongoose'
import logging from '../config/logging';
import userSchema from '../models/user';
import { IUser } from '../interfaces/user';
import roomSchema from '../models/roomSchema';
import { IMessage, IMessageDB } from '../interfaces/chat/IMessage';
import { IRoomDB } from '../interfaces/chat/room';
import drawingSchema from '../models/drawingSchema';
import { IDrawing, IDrawingDB } from '../interfaces/drawing/drawing';
import { Privacy } from '../Enum/privacy';
import { VectorObject } from '../interfaces/drawing/vectorObject';
import { Line } from '../interfaces/drawing/line';
import { VectorObjectClass } from '../classes/shapes/vectorObject';
import teamSchema from '../models/teamSchema';
import { ITeamDB } from '../interfaces/team';
import { resolve } from 'dns';
import { IAction } from '../interfaces/IAction';
import drawingVersionSchema from '../models/drawingVersionSchema';
import drawingService from './drawingService';

const NAMESPACE = 'databaseService'

class databaseService {

    constructor() {
        this.setupConnection()
    }
    
    /*
        PRIVATE
    */
    private setupConnection() {
        mongoose
            .connect(config.mongo.url)
            .then((res) => {
                logging.info(NAMESPACE, "Connected to database")
            })
            .catch((error) => {
                logging.error(NAMESPACE, " " + error)
            })
    }

    /*
        PUBLIC
    */
    public async registerUser(
        user_email: string,
        user_password: string,
        user_firstName: string,
        user_lastname: string,
        user_userName: string,
        user_avatar: string,
        user_lastConnection: number,
        user_lastDeconnection: number
    ) {
        let userLastConnection = [user_lastConnection];
        let userLastDeconnection = [user_lastDeconnection];
        const user = new userSchema({
            email            : user_email,
            password         : user_password,
            firstname        : user_firstName,
            lastname         : user_lastname,
            username         : user_userName,
            avatar           : user_avatar,
            lastConnection   : userLastConnection,
            LastDeconnection : userLastDeconnection,
            historiqueEdition: [],
            collaborations   : [],
            ownership        : [],
            teams            : [],
            totalTimeCollab  : 0,
            isNamePublic     : true,
            isEmailPublic    : true,
            lastAction       : []
        })

        user
        .save()
        .catch((error) => {
            throw new Error("Failed to register")
        })
    }

    public async findUserByEmail(
        email: string
    ) {
        return await userSchema.find({email: email})
        .then((data) => {
            if (data.length == 1) {
                return data[0] as IUser
            } else if (data.length > 1) {
                throw new Error("Found duplicate user");
            } else {
                throw new Error("Found no with that email user");
            }
        })
        .catch((error) => {
            throw new Error("Could not find user")
        })
    }

    public async countEmail(
        email: string,
    ) {
        return await userSchema.count({ email: email })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            throw new Error(error)
        })
    }

    public async countUsername(
        username: string
    ) {
        return await userSchema.count({ username: username })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            throw new Error(error)
        })
    }

    public async updateUserInfo(
        user_email: string,
        update: any
    ){
        const filter = { email: user_email }
        userSchema.findOneAndUpdate(filter, update)
        .then(() => {
            return "Updated user info successfully"
        })
        .catch((error) => {
            throw new Error(error.message)
        })
    }

    public async updateUserLastAction(
        email: string,
        action: IAction
    ) {
        userSchema.findOneAndUpdate({
            email: email
        }, {
            $push : { lastAction : {
                action: action.action,
                timestamp: action.timestamp,
                drawing: action.drawing
            }}
        })
        .then((res) => {
            return "Updated user last action sucessfully"
        })
        .catch((error) => {
            throw new Error("Could not update user last action")
        })
    }
    
    public async updateUserLastConnection(
        email : string,
        date : number
    ) {
        userSchema.findOneAndUpdate({
            email : email
        }, {
            $push : { lastConnection : date }
        })
        .then((res) => {
            return "Updated user info successfully"
        })
        .catch((error) => {
            console.log('error')
            throw new Error("Could not update User")
        })
    }

    public async updateUserLastDeconnection(
        email : string,
        date : number
    ) {
        // TODO changer pour email
        userSchema.findOneAndUpdate({
            email : email
        }, {
            $push : { LastDeconnection : date }
        })
        .then((res) => {
            return "Updated user info successfully"
        })
        .catch((error) => {
            throw new Error("Could not update User")
        })
    }

    public async updateUserHistoriqueEdition(
        email : string,
        dessin : string
    ) {
        userSchema.findOneAndUpdate({
            email : email
        }, {
            $push : { historiqueEdition : dessin }
        })
        .then(() => {
            return "Updated user info successfully"
        })
        .catch((error) => {
            throw new Error("Could not update User")
        })
    }

    public async updateUsercollaborations(
        email : string,
        dessin : string
    ) {
        userSchema.findOneAndUpdate({
            email : email
        }, {
            $push : { collaborations : dessin }
        })
        .then(() => {
            return "Updated user info successfully"
        })
        .catch((error) => {
            throw new Error("Could not update User")
        })
    }

    public async updateUserOwnership(
        email : string,
        dessin : string
    ) {
        userSchema.findOneAndUpdate({
            email : email
        }, {
            $push : { ownership : dessin }
        })
        .then(() => {
            return "Updated user info successfully"
        })
        .catch((error) => {
            throw new Error("Could not update User")
        })
    }

    public async updateUserTeams(
        email : string,
        team : string
    ) {
        userSchema.findOneAndUpdate({
            email : email
        }, {
            $push : { teams : team }
        })
        .then(() => {
            return "Updated user info successfully"
        })
        .catch((error) => {
            throw new Error("Could not update User")
        })
    }

    public async removeUserTeams(
        email : string,
        team : string
    ) {
        userSchema.findOneAndUpdate({
            email : email
        }, {
            $pull : { teams : team }
        })
        .then(() => {
            return "Updated user info successfully"
        })
        .catch((error) => {
            throw new Error("Could not update User")
        })
    }

    public async getAllUsers() {
        return await userSchema.find({})
        .then((data) => {
            if (data.length > 0) {
                return data as Array<IUser>
            }
            else {
                throw new Error("Found no room")
            }
        })
        .catch((error) => {
            throw new Error("Failed to load rooms")
        })
    }

    public async createRoom(
        room_name: string,
        room_owner: string,
        room_password?: string
    ) {
        // verify if room already exist

        let chatlog = new Array<IMessage>();
        let userList = [room_owner];
        if (room_password) {
            const room = new roomSchema({
                name       : room_name,
                owner      : room_owner,
                password   : room_password,
                history    : chatlog,
                users      : userList
            })

            room
            .save()
            .catch((error) => {
                throw new Error("Failed to create room")
            })
        } else {
            const room = new roomSchema({
                name       : room_name,
                owner      : room_owner,
                history    : chatlog,
                users      : userList
            })

            room.save()
            .then(() => {
                return "Created room successfully"
            })
            .catch((error) => {
                throw new Error("Failed to create room")
            })
        }
    }

    public async findRoomByName(
        room_name : string
    ) {
        return await roomSchema.find({name: room_name})
        .then((data) => {
            if (data.length == 1) {
                return data[0] as IRoomDB
            } else if (data.length > 1) {
                throw new Error("Found duplicate room");
            } else {
                throw new Error("Found no room");
            }
        })
        .catch((error) => {
            throw new Error("Could not find room")
        })
    }

    public async logRoomMessage(
        room_name : string,
        message : IMessageDB
    ) {
        roomSchema.findOneAndUpdate({
            name : room_name
        }, {
            $push : { history : message }
        })
        .then(() => {
            return "Saved message succesfully"
        })
        .catch((error) => {
            throw new Error("Could not save message")
        })
    }

    public async getAllRooms() {
        return await roomSchema.find({})
        .then((data) => {
            if (data.length > 0) {
                return data as Array<IRoomDB>
            }
            else {
                throw new Error("Found no room")
            }
        })
        .catch((error) => {
            throw new Error("Failed to load rooms")
        })
    }

    public async addUserToRoom(
        room_name: string,
        user: string
    ) {
        roomSchema.findOneAndUpdate({
            name: room_name
        }, {
            $push : { users : user }
        })
        .then(() => {
            return "Sucessfully added user [" + user + "] in Room [" + room_name + "]."
        })
        .catch((error) => {
            throw new Error("Failed to add user [" + user + "] in Room [" + room_name + "].")
        })
    }

    public async removeUserFromRoom(
        room_name: string,
        user: string
    ) {
        roomSchema.findOneAndUpdate({
            name: room_name
        }, {
            $pull: { users: user }
        })
        .then(() => {
            return "Successfully removed user [" + user + "] from Room [" + room_name + "]."
        })
        .catch((error) => {
            throw new Error("Failed to remove user [" + user + "] from Room [" + room_name + "].")
        })
    }

    public async deleteRoom(
        room_name: string
    ) {
        roomSchema.findOneAndDelete({
            name: room_name
        })
        .then(() => {
            return "Successfully deleted room [" + room_name + "]."
        })
        .catch((error) => {
            throw new Error("Failed to delete room ["+ room_name + "].")
        })
    }

    public async createDrawing(
        drawing_name: string,
        drawing_owner: string,
        drawing_privacy: Privacy,
        timestamp: Number,
        drawing_objects: Array<VectorObject>,
        drawing_preview: string,
        team: string | undefined,
        drawing_password: string
    ) {
        let privacy_string = (drawing_privacy == Privacy.public) ? "public" : (drawing_privacy == Privacy.protected) ? "protected" : "private"
        if (drawing_password) {
            const drawing = new drawingSchema({
                name              : drawing_name,
                password          : drawing_password,
                owner             : drawing_owner,
                creationTimestamp : timestamp,
                privacy           : privacy_string,
                objects           : drawing_objects,
                preview           : drawing_preview,
                team              : team,
                version           : 0,
                versions          : 1,
                z                 : 0
            });
            drawing
            .save()
            .then(() => {
                const drawingVersion = new drawingVersionSchema({
                    name: drawing_name,
                    versions: [{ objects: drawing_objects }]
                })
                console.log()
                drawingVersion
                .save()
                .catch((error) => {
                    console.log(error);
                    throw new Error("Failed to create drawing")
                });;
            })
            .catch((error) => {
                console.log(error);
                throw new Error("Failed to create drawing");
            });
        } else {
            const drawing = new drawingSchema({
                name              : drawing_name,
                owner             : drawing_owner,
                creationTimestamp : timestamp,
                privacy           : privacy_string,
                objects           : drawing_objects,
                preview           : drawing_preview,
                team              : team,
                version           : 0,
                versions          : 1,
                z                 : 0
            });

            drawing
            .save()
            .then(() => {
                const drawingVersion = new drawingVersionSchema({
                    name: drawing_name,
                    versions: [{ objects: drawing_objects }]
                })
                drawingVersion
                .save()
                .catch((error) => {
                    console.log(error);
                    throw new Error("Failed to create drawing")
                });
            })
            .catch((error) => {
                console.log(error);
                throw new Error("Failed to create drawing")
            });
        }
    }

    public async getDrawing(name: string) {
        return await drawingSchema.find({ name })
        .then((data) => {
            if (data.length > 1) {
                return data;
            } else {
                throw new Error("Found no drawing")
            }
        })
        .catch((error) => {
            throw new Error("Could not find drawing")
        })
    }
    // TODO query pour tout les dessin d'une personne en particulier.

    public async getAllDrawings() {
        return await drawingSchema.find({})
        .then((data) => {
            if (data.length > 0) {
                return data;
            } else {
                throw new Error("No drawing found.");
            }
        })
        .catch((error) => {
            throw new Error("Could not find drawing.");
        })
    }

    public async updateDrawingOwner(name: string, owner: string) {
        return await drawingSchema.findOneAndUpdate({ name: name },{ owner: owner })
        .then(() => {
            return "Successfully updated drawing's owner [" + name + "]"
        })
        .catch((error) => {
            throw new Error("Failed to update drawing [" + name + "]")
        })
    }

    public async updateDrawingVersion(name: string, version: number) {
        return await drawingSchema.findOneAndUpdate({ name: name } , { version: version })
        .then((doc) => {
            return "Successfully updated drawing's version [" + name + "]"
        })
        .catch((error) => {
            throw new Error("Failed to update drawing [" + name + "]")
        })

    }

    public increase_version_count(name: string) {
        let drawing_nbVersions = drawingService.getDrawings().get(name)?.versions;
        drawingSchema.findOneAndUpdate({ name: name }, { versions : drawing_nbVersions })
        .then(() => {
            return "Successfully updated drawing's versions [" + name + "]"
        })
        .catch((error) => {
            throw new Error("Failed to update drawing [" + name + "]")
        })
    }

    public async updateDrawing(name: string, objects: Array<VectorObject>, z: number, preview?: string) {
        return await drawingSchema.findOneAndUpdate({ name }, { preview, objects, z })
        .then(() => {
            return "Successfully updated drawing [" + name + "]"
        })
        .catch((error) => {
            throw new Error("Failed to update drawing [" + name + "]")
        })
    }

    public async updatePreview(name: string, preview: string) {
        return await drawingSchema.findOneAndUpdate({ name }, { preview })
        .then(() => {
            return "Successfully updated drawing [" + name + "]"
        })
        .catch((error) => {
            throw new Error("Failed to update drawing [" + name + "]")
        })
    }

    

    async new_version(name: string, objects: { objects : Array<VectorObject> }) {
        drawingService.getDrawings().get(name)!.versions++;
        console.log('objects', objects, " name ", name);
        return await drawingVersionSchema.findOneAndUpdate({
            name: name
        }, {
            $push : { versions:  objects }
        })
        .then(async () => {
            console.log('increasing version count!');
            this.increase_version_count(name);
            return "Successfully updated drawing [" + name + "]"
        })
        .catch((error) => {
            throw new Error("Failed to update drawing [" + name + "]")
        })
    }

    async save_current_version(name: string, objects: Array<VectorObject>, version: number) {
        return await drawingVersionSchema.findOne({ name: name }).then(doc => {
            if(doc){
                doc.versions[version] = { objects : objects };
                doc.save();
            }
            console.log('ok here');
            return "Successfully updated drawing [" + name + "]";
            //sent respnse to client
          }).catch(err => {
              console.log(err)
          });
    }

    async get_version(name: string, version: number) {
        return await drawingVersionSchema.findOne({name: name}).then(doc => {
            if (doc) {
                console.log(version)
                // console.log(doc.versions)
                return doc.versions[version].objects as Array<VectorObject>;
            }
        }).catch(err => {
            console.log(err)
        })
    }

    public async createTeam(name: string, owner: string, password: string, users: Array<string>, maxUsers: number, bio: string) {
        
            const room = new teamSchema({
                name       : name,
                owner      : owner,
                password   : password,
                users      : users,
                maxUsers   : maxUsers,
                bio        : bio
            })
            room
            .save()
            .catch((error) => {
                throw new Error("Failed to create team");
            })
    }

    public async countTeamName(
        name: string,
    ) {
        return await teamSchema.count({ name: name })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            throw new Error(error)
        })
    }

    public async getAllTeams() {
        return await teamSchema.find({})
        .then((data) => {
            if (data.length > 0) {
                return data as Array<ITeamDB>
            }
            else {
                throw new Error("Found no team")
            }
        })
        .catch((error) => {
            throw new Error("Failed to load teams")
        })
    }

    
    public async deleteTeam(
        name: string
    ) {
        teamSchema.findOneAndDelete({
            name: name
        })
        .then(() => {
            return "Successfully deleted team [" + name + "]."
        })
        .catch((error) => {
            throw new Error("Failed to delete room ["+ name + "].")
        })
    }

    public async addUserToTeam(
        team_name: string,
        user: string
    ) {
        teamSchema.findOneAndUpdate({
            name: team_name
        }, {
            $push : { users : user }
        })
        .then(() => {
            return "Sucessfully added user [" + user + "] in team [" + team_name + "]."
        })
        .catch((error) => {
            throw new Error("Failed to add user [" + user + "] in team [" + team_name + "].")
        })
    }

    public async removeUserFromTeam(
        team: string,
        user: string
    ) {
        teamSchema.findOneAndUpdate({
            name: team
        }, {
            $pull: { users: user}
        })
        .then(() => {
            return "Successfully removed user [" + user + "] from team [" + team + "]."
        })
        .catch((error) => {
            throw new Error("Failed to remove user [" + user + "] from team [" + team + "].")
        })
    }

    public async deleteDrawing(
        name: string
    ) {
        drawingSchema.findOneAndDelete({
            name: name
        })
        .then(() => {
            return "Successfully deleted drawing [" + name + "]";
        })
        .catch((error) => {
            throw new Error("Failed to delete drawing [" + name + "]");
        })
    }
}

let DatabaseService = new databaseService();

export default DatabaseService;