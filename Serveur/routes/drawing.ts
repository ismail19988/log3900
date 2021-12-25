import express from 'express';
import controller from '../controllers/drawing'

const router = express.Router();

router.post('/create', controller.create_drawing);

router.post('/update', controller.update_preview);

router.post('/save', controller.save);

router.post('/new_version', controller.new_version);

router.get('/get_all_drawings', controller.get_all_drawings);

router.post('/get_drawing_data', controller.get_drawing_data);

router.post('/join_drawing', controller.join_drawing);

router.post('/leave_drawing', controller.leave_drawing);

router.post('/swap_version', controller.swap_version);

export = router;