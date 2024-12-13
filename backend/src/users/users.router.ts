import { Router } from 'express';
import { signin, signup } from './users.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/profile_pictures' });

router.post('/signin', signin);
router.post('/signup', upload.single('profile_picture'), signup);

export default router;