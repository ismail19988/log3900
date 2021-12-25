import express from 'express';
import http from 'http';
import config from './config/config';
import logging from './config/logging';
import sampleRoutes from './routes/sample';
import user from './routes/user';
import chat from './routes/chat'
import drawing from './routes/drawing'
import team from './routes/team'
import socketService from './services/socketService';

const NAMESPACE = 'Server';

const router = express();
var bodyParser  = require('body-parser');
router.set('PORT', config.server.port)
router.use(express.json({limit: '4mb'}));

/** Rules of our API */
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

/** routes */
router.use('/sample', sampleRoutes);
router.use('/user', user);
router.use('/chat', chat);
router.use('/drawing', drawing);
router.use('/team', team)


/** Error handling */
router.use((req, res, next) => {
  const error = new Error('Not found');
  res.status(404).json({
      message: error.message
  });
});

const server = http.createServer(router);
socketService.init(server);

server.listen(router.get('PORT'), () => {
  logging.info(NAMESPACE, `Server is running ${config.server.hostname}:${config.server.port}`)
});

