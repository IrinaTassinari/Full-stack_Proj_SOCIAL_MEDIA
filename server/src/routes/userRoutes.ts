import { Router } from "express";
import {getUserProfile, updateUserProfile} from '../controllers/userController.js';
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadUserImage.js";

const router = Router();

router.patch('/me', authMiddleware, upload.single('avatar'), updateUserProfile); 

router.get('/:id', getUserProfile);


export default router

/**
 * //'avatar' — это имя поля файла в Postman,  .single() — это метод multer,  ожидаем один файл в поле form-data с названием avatar 
 * 
 * После upload.single('avatar') в req появляется: req.file
 */