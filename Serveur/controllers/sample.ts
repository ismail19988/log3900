import { NextFunction, Request, Response } from 'express';

const serverHealthCheck = (req: Request, res: Response, next: NextFunction) => {  
    return res.status(200).json({
        title:"Authorized",
        message: "pong"
    });
};

export default { serverHealthCheck };