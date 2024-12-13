import { Router } from 'express';
import { uploadResource } from './resources.controller';
import multer from 'multer';
import { checkToken } from '../users/users.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/resources' });

router.post("/", upload.array('resources'), checkToken, uploadResource);

export default router;