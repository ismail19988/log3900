import express from 'express';
import controller from '../controllers/team'

const router = express.Router();

router.post('/create', controller.create_team);

router.post('/join_team', controller.join_team);

router.post('/leave_team', controller.leave_team);

router.post('/delete', controller.delete_team);

router.post('/get_all_teams', controller.get_all_teams);

export = router;