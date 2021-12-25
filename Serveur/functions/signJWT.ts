import jwt from "jsonwebtoken";
import config from "../config/config";
import logging from "../config/logging";

const NAMESPACE = "Auth";

const signJWT = (email: string, callback: (error:Error | null, token:string | null) => void) => {

    logging.info(NAMESPACE, 'attempting to sign token for ' + email);

    try {
        jwt.sign(
            {
                email
            },
            config.server.token.secret,
            {
                issuer      : config.server.token.issuer,
                algorithm   : 'HS256',
                expiresIn   : config.server.token.expireTime
            },
            (error, token) => {
                if(error) {
                    callback(error, null);
                } else if (token) {
                    callback(null, token);
                }
            }
        )
    } 
    catch(error: any) {
        logging.error(NAMESPACE, error.message, error)
    }

}

export default signJWT;