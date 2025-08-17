const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            tracks: true
          }
        }
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get all tracks for a user
router.get('/:id/tracks', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only access their own tracks
    if (id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tracks = await prisma.track.findMany({
      where: { userId: id },
      include: {
        predictions: {
          include: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            predictions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ tracks });
  } catch (error) {
    console.error('Get user tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Get user statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only access their own stats
    if (id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await prisma.user.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            tracks: true
          }
        },
        tracks: {
          select: {
            predictions: {
              select: {
                confidence: true,
                tag: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!stats) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate additional statistics
    const totalTracks = stats._count.tracks;
    const totalPredictions = stats.tracks.reduce((sum, track) => sum + track.predictions.length, 0);
    
    // Calculate average confidence
    const allConfidences = stats.tracks.flatMap(track => 
      track.predictions.map(pred => pred.confidence)
    );
    const avgConfidence = allConfidences.length > 0 
      ? allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length 
      : 0;

    // Get top tags
    const tagCounts = {};
    stats.tracks.forEach(track => {
      track.predictions.forEach(pred => {
        if (pred.tag) {
          const tagName = pred.tag.name;
          tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
        }
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    res.json({
      stats: {
        totalTracks,
        totalPredictions,
        averageConfidence: Math.round(avgConfidence * 100) / 100,
        topTags
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: req.user.id }
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { email },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
