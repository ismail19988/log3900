import express from 'express';
import controller from '../controllers/chat'

const router = express.Router();

//router.get('/validate', extractjwt.extractJWT_http, controller.validateToken);

router.post('/join_room', controller.join_room);

router.post('/room_data', controller.getRoomData);

router.post('/create_room', controller.create_room);

router.get('/all_rooms', controller.GetAllRooms);

router.post('/leave_room', controller.leaveRoom);

router.post('/delete_room', controller.delete_room);

router.post('/user_joined_rooms', controller.getJoinedRooms);

router.post('/user_unjoined_rooms', controller.getUnjoinedRooms);

export = router;