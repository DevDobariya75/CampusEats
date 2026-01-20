import express from 'express';
import { getProjects } from '../controllers/user.js';

const router = express.Router();

router.get('/', getProjects);

export default router;