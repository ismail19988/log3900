import express from 'express';
import controller from '../controllers/user'
import extractjwt from '../middleware/extractjwt'

const router = express.Router();

router.get('/validate', extractjwt.extractJWT_http, controller.validateToken);

router.post('/register', controller.register);

router.post('/login', controller.login);

router.post('/logout', controller.logout);

router.post('/get_user_data', controller.get_user_data);

router.post('/update_username', controller.update_username);

router.post('/update_avatar', controller.update_avatar);

router.post('/update_password', controller.update_password);

router.post('/update_fullname_privacy', controller.update_fullname_privacy);

router.post('/update_email_privacy', controller.update_email_privacy);

export = router;