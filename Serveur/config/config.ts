


const MONGO_USERNAME = "ismail";
const MONGO_PASSWORD = "1234";
const MONGO_HOST = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@log3900-102-mongo.wiq43.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const MONGO = {
    host: MONGO_HOST,
    password: MONGO_PASSWORD,
    username: MONGO_USERNAME,
    url: MONGO_HOST
}

const SERVER_HOST_NAME = process.env.HOST || 'localhost'
const SERVER_PORT = process.env.PORT || 3000;


const SERVER_TOKEN_EXPIRETIME = process.env.TOKEN_EXPIRETIME || 10800 /** 12 hours */
const SERVER_TOKEN_ISSUER = process.env.TOKEN_ISSUER || 'LOG3900-102'
const SERVER_TOKEN_SECRET = process.env.TOKEN_SECRET || 'SecretKey'


const server = {
    hostname : SERVER_HOST_NAME,
    port : SERVER_PORT,
    token : {
        expireTime : SERVER_TOKEN_EXPIRETIME,
        issuer : SERVER_TOKEN_ISSUER,
        secret : SERVER_TOKEN_SECRET
    }
}

const config = {
    server: server,
    mongo: MONGO
}

export default config;