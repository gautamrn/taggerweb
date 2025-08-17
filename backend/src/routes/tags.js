const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(100, 'Tag name too long')
});

// Create tag
router.post('/', auth, async (req, res) => {
  try {
    const { name } = tagSchema.parse(req.body);
    
    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: name.toLowerCase() }
    });

    if (existingTag) {
      return res.status(400).json({ error: 'Tag already exists' });
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        name: name.toLowerCase()
      }
    });

    res.status(201).json({
      message: 'Tag created successfully',
      tag
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            predictions: true
          }
        }
      }
    });

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get tag by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        predictions: {
          include: {
            track: {
              select: {
                id: true,
                title: true,
                user: {
                  select: {
                    id: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            predictions: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ tag });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// Delete tag (only if no predictions exist)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            predictions: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (tag._count.predictions > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete tag that has predictions. Remove predictions first.' 
      });
    }

    await prisma.tag.delete({
      where: { id }
    });

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

module.exports = router;
