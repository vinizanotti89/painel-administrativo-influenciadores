import express from 'express';
import { InfluencerController } from '../controllers/influencerController.js';
import { validateRequest } from '../middleware/validator.js';
import { authMiddleware } from '../middleware/auth.js';
import { cacheMiddleware } from '../config/redis.js';

/**
 * @swagger
 * /api/influencers:
 *   get:
 *     summary: Retorna lista de influenciadores
 *     tags: [Influenciadores]
 *     responses:
 *       200:
 *         description: Lista de influenciadores
 */
router.get('/', cacheMiddleware(300), InfluencerController.getInfluencers);

/**
 * @swagger
 * /api/influencers/{id}:
 *   get:
 *     summary: Retorna um influenciador por ID
 *     tags: [Influenciadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', cacheMiddleware(300), InfluencerController.getInfluencerById);

/**
 * @swagger
 * /api/influencers:
 *   post:
 *     summary: Cria um novo influenciador
 *     tags: [Influenciadores]
 *     security:
 *       - BearerAuth: []
 */
router.post('/', authMiddleware, validateRequest, InfluencerController.createInfluencer);

/**
 * @swagger
 * /api/influencers/{id}:
 *   put:
 *     summary: Atualiza um influenciador
 *     tags: [Influenciadores]
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id', authMiddleware, validateRequest, InfluencerController.updateInfluencer);

/**
 * @swagger
 * /api/influencers/{id}:
 *   delete:
 *     summary: Remove um influenciador
 *     tags: [Influenciadores]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', authMiddleware, InfluencerController.deleteInfluencer);

export default router;