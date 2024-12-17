import { Router } from 'express';
import { getResources, uploadResource, getResourceById, updateResourceById, deleteResourceById, likeResourceById, commentResourceById, getOwnResources, downloadResourceFile } from './resources.controller';
import { chatHandler, getChatHandler, chatHomeHandler, deleteChatHandler } from './chat.controller'
import multer from 'multer';
import { checkToken } from '../users/users.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/resources' });

router.get("/", getResources);
router.get("/own/", checkToken, getOwnResources);
router.get("/:id", getResourceById);
router.post("/", upload.array('resources'), checkToken, uploadResource);
router.put("/:id", upload.array('resources'), checkToken, updateResourceById);
router.delete("/:id", checkToken, deleteResourceById);
router.put("/:id/like", checkToken, likeResourceById);
router.put("/:id/comment", checkToken, commentResourceById);
router.post("/download/", downloadResourceFile);


export default router;