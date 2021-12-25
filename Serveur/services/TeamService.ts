import { Server, Socket } from "socket.io";
import { Team } from "../classes/team";
import logging from "../config/logging";
import { ITeam, ITeamDB } from "../interfaces/team";
import DatabaseService from "./databaseService";
import userService, { status } from "./UserService";

class TeamService {

    private NAMESPACE = "Team service"
    private io: Server;
    private teams = new Map<string, Team>();

    public async init(server : Server) {
        this.io = server;
        this.setUPConnection();
            /** Load all rooms from database and add them to the map */
            await DatabaseService.getAllTeams()
            .then((existing_teams: Array<ITeamDB>) => {
                existing_teams.forEach((team: ITeamDB) => {
                    let team_instance = new Team(team.name, team.owner, team.bio, team.users, team.password, team.maxUsers);
                    this.teams.set(team_instance.getName(), team_instance);
                });
            })
            .catch((error) => {
                logging.error(this.NAMESPACE, error.message);
            })

    }

    public setUPConnection() {
        this.io.on("connection", async (socket: Socket) => {
            let user: any = socket.handshake.query.user;
            if(!user || user == undefined) {
                logging.info(this.NAMESPACE, "Undefined User tried to login, connection refused");
            }

            else {
                userService.setUserStatus(user, status.CONNECTED);
                this.io.emit('change_status', { user: user, status: status.CONNECTED });
                //this.joinCollaboration(socket);
                //this.leaveCollaboration(socket);
                //this.disconnect(socket);
            }
        })
    }

    /*joinCollaboration(socket: Socket) {
        socket.on('join_collaboration', () => {
            let user = userService.getUserFromSocketID(socket.id);
            if(user ){
                userService.setUserStatus(user as string, status.BUSY);
                this.io.emit('change_status', { user: user, status: status.BUSY });
            }
        })
    }*/

    /*leaveCollaboration(socket: Socket) {
        socket.on('leave_collaboration', () => {
            let user = userService.getUserFromSocketID(socket.id);
            if(user){
                userService.setUserStatus(user as string,  status.CONNECTED);
                this.io.emit('change_status', { user: user, status: status.CONNECTED });
            }
        })
    }*/

    /*disconnect(socket: Socket) {
        socket.on('disconnect', () => {
            let user = userService.getUserFromSocketID(socket.id);
            if(user) {
                userService.setUserStatus(user as string, status.DISCONNECTED)
                this.io.emit('change_status', { user: user, status: status.DISCONNECTED });
            }
        })
    }*/

    public getTeams() {
        return this.teams;
    }

    public deleteTeam(name: string){
        this.teams.delete(name);
    }

    public addTeam(team: ITeam) {
        let team_instance = new Team(team.name, team.owner, team.bio, team.users, team.password, team.maxUsers);
        this.teams.set(team_instance.getName(), team_instance);
    }

}

const teamService = new TeamService()

export default teamService;