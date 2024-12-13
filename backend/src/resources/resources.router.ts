import { Router } from 'express';
import { uploadResource } from './resources.controller';
import { chatHandler, getChatHandler, chatHomeHandler, deleteChatHandler } from './chat.controller'
import multer from 'multer';
import { checkToken } from '../users/users.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/resources' });

router.post("/", upload.array('resources'), checkToken, uploadResource);
router.post("/chat", chatHandler)
router.post("/chat/home", chatHomeHandler)
router.get("/chat", getChatHandler)
router.delete("/chat", deleteChatHandler)

export default router;