import { AbstractCommand } from "../classes/commands/abstractCommand";
import logging from "../config/logging";

class CommandControllerService {

    private NAMESPACE = 'Command Controller Service'

    commandsDone: Map<string, AbstractCommand[]> = new Map<string, AbstractCommand[]>();
    commandsUndone: Map<string, AbstractCommand[]> = new Map<string, AbstractCommand[]>();
    // id -> user
    lastUpdate: Map<string, string> = new Map<string, string>();

    undo(user: string): void {
        let userCommandsDone = this.commandsDone.get(user);
        let userCommandsUndone = this.commandsUndone.get(user);

        if (userCommandsDone && userCommandsUndone && userCommandsDone.length > 0) {
            let command;
            while (userCommandsDone.length > 0) {
                command = userCommandsDone.pop();
                let id = command?.getObject().getId();
                if (this.lastUpdate.get(id as string) == user) {
                    break;
                }
                else {
                    command = undefined;
                }
            }

            if (command) {
                userCommandsUndone.push((command as AbstractCommand).cancel());
                logging.info(this.NAMESPACE, "user " + user + " undid the change on object " + command.getObject().getId());
            } else {
                logging.info(this.NAMESPACE, "user " + user + " has nothing to undo.");
            }
        }
    }

    redo(user: string): void {
        let userCommandsDone = this.commandsDone.get(user);
        let userCommandsUndone = this.commandsUndone.get(user);

        if (userCommandsDone && userCommandsUndone && userCommandsUndone.length > 0) {
            let command;
            while (userCommandsUndone.length > 0) {
                command = userCommandsUndone.pop();
                let id = command?.getObject().getId();
                if (this.lastUpdate.get(id as string) == user) {
                    break;
                }
            }

            if (command) {
                userCommandsDone.push((command as AbstractCommand).execute());
                logging.info(this.NAMESPACE, "user " + user + " redid the change on object " + command.getObject().getId());
            } else {
                logging.info(this.NAMESPACE, "user " + user + " has nothing to redo.");
            }
        }
    }

    addUser(user: string): void {
        this.commandsDone.set(user, []);
        this.commandsUndone.set(user, []);
    }

    removeUser(user: string): void {
        this.commandsDone.delete(user);
        this.commandsUndone.delete(user);
    }

    addCommand(user: string, command: AbstractCommand): void {
        let commandsDone = this.commandsDone.get(user);
        let commandsUndone = this.commandsUndone.get(user);
        if (commandsDone && commandsUndone) {
            commandsDone.push(command);
            this.clearCommandsUndone(user);
        }
    }

    setLastUpdate(id: string, user: string) {
        this.lastUpdate.set(id, user);
    }

    clearCommandsUndone(user: string): void {
        let userCommandsUndone = this.commandsUndone.get(user);

        if (userCommandsUndone) {
            this.commandsUndone.set(user, []);
        }
    }
}

let commandControllerService = new CommandControllerService();

export default commandControllerService;