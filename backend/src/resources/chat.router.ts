import { Router } from 'express';
import { chatHandler, getChatHandler, chatHomeHandler, deleteChatHandler } from './chat.controller'

const router = Router();


router.post("/", chatHandler)
router.post("/home", chatHomeHandler)
router.get("/", getChatHandler)
router.delete("/", deleteChatHandler)

export default router;