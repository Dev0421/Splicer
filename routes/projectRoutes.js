const express = require('express');
const { createProject, getProjects, getProjectById, updateProject, deleteProject, searchProjects } = require('../controllers/projectController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/project/create', authenticate, createProject);
router.get('/projects/', authenticate, getProjects);
router.get('/project/:id', authenticate, getProjectById);
router.put('/project/:id', authenticate, updateProject);
router.delete('/project/:id', authenticate, deleteProject);
router.get('/projects/search', authenticate, searchProjects);

module.exports = router;
