import { Router } from 'express';
import { signin, signup,getUserHandler } from './users.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/profile_pictures' });

router.get('/:_id', getUserHandler);
router.post('/signin', signin);
router.post('/signup', upload.single('profile_picture'), signup);

export default router;