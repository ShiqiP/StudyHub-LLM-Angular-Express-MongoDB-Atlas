import { Router } from 'express';
import { chatHandler, getChatHandler, chatHomeHandler, deleteChatHandler } from './chat.controller'
import { checkToken } from '../users/users.middleware';

const router = Router();


router.post("/", checkToken, chatHandler)
router.post("/home", checkToken, chatHomeHandler)
router.get("/", checkToken, getChatHandler)
router.delete("/", checkToken, deleteChatHandler)

export default router;