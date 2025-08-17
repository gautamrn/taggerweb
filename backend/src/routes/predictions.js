const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const predictionSchema = z.object({
  trackId: z.string().min(1, 'Track ID is required'),
  tagId: z.string().optional(),
  confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1')
});

// Create prediction
router.post('/', auth, async (req, res) => {
  try {
    const { trackId, tagId, confidence } = predictionSchema.parse(req.body);
    
    // Verify track belongs to user
    const track = await prisma.track.findFirst({
      where: { 
        id: trackId,
        userId: req.user.id
      }
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Verify tag exists if provided
    if (tagId) {
      const tag = await prisma.tag.findUnique({
        where: { id: tagId }
      });

      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
    }

    // Create prediction
    const prediction = await prisma.prediction.create({
      data: {
        trackId,
        tagId,
        confidence
      },
      include: {
        track: {
          select: {
            id: true,
            title: true
          }
        },
        tag: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Prediction created successfully',
      prediction
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create prediction error:', error);
    res.status(500).json({ error: 'Failed to create prediction' });
  }
});

// Get predictions for a track
router.get('/track/:trackId', auth, async (req, res) => {
  try {
    const { trackId } = req.params;
    
    // Verify track belongs to user
    const track = await prisma.track.findFirst({
      where: { 
        id: trackId,
        userId: req.user.id
      }
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const predictions = await prisma.prediction.findMany({
      where: { trackId },
      include: {
        tag: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { confidence: 'desc' }
    });

    res.json({ predictions });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Get all predictions for user's tracks
router.get('/my-tracks', auth, async (req, res) => {
  try {
    const predictions = await prisma.prediction.findMany({
      where: {
        track: {
          userId: req.user.id
        }
      },
      include: {
        track: {
          select: {
            id: true,
            title: true
          }
        },
        tag: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ predictions });
  } catch (error) {
    console.error('Get user predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Update prediction
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { confidence, tagId } = req.body;
    
    // Verify prediction belongs to user's track
    const prediction = await prisma.prediction.findFirst({
      where: { id },
      include: {
        track: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    if (prediction.track.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update prediction
    const updatedPrediction = await prisma.prediction.update({
      where: { id },
      data: {
        confidence: confidence !== undefined ? confidence : prediction.confidence,
        tagId: tagId !== undefined ? tagId : prediction.tagId
      },
      include: {
        track: {
          select: {
            id: true,
            title: true
          }
        },
        tag: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      message: 'Prediction updated successfully',
      prediction: updatedPrediction
    });
  } catch (error) {
    console.error('Update prediction error:', error);
    res.status(500).json({ error: 'Failed to update prediction' });
  }
});

// Delete prediction
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify prediction belongs to user's track
    const prediction = await prisma.prediction.findFirst({
      where: { id },
      include: {
        track: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    if (prediction.track.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.prediction.delete({
      where: { id }
    });

    res.json({ message: 'Prediction deleted successfully' });
  } catch (error) {
    console.error('Delete prediction error:', error);
    res.status(500).json({ error: 'Failed to delete prediction' });
  }
});

module.exports = router;
