import { Router } from 'express';
import { uploadResource } from './resources.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/resources' });

router.post("/", upload.array('resources'), uploadResource);

export default router;