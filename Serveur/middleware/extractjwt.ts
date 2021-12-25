import { Response, Request, NextFunction} from 'express';
import logging from '../config/logging';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { Socket } from 'socket.io';

const NAMESPACE = "Auth"

const extractJWT_http = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, "Validating token");

    let token = req.headers.authorization;
    if(token) {
        jwt.verify(
            token,
            config.server.token.secret,
            (error, decoded) => {
                if (error)
                {
                    return res.status(404).json({
                        message: error.message,
                        error
                    })
                }
                else
                {
                    res.locals.jwt = decoded;
                    next();
                }
            }
        );
    } else {
        return res.status(401).json({
            title : "Unauthorized",
            message: "No token provided."
        })
    }
}

const extractJWT_socket = (socket: Socket, next: (err?: Error | undefined) => void) => {

    let token = socket.handshake.query.token as string;

    if (token)
    {
        logging.info(NAMESPACE, 'Authentifiying token ' + token);
        jwt.verify(
            token,
            config.server.token.secret,
            (error, decoded) => {
                /** decoded: est un objet qui contient la valeur encodée du token */
                if (error){
                    return next(new Error('Authentification failed'));
                } else {
                    logging.info(NAMESPACE, 'token authentified successfully !');
                    next();
                }
        });
    }
    else
    {
        next(new Error('Authentication error invalid or missing token'));
    }   
}

export default {
    extractJWT_http,
    extractJWT_socket
};