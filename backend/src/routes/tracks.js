const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const auth = require('../middleware/auth');
const { uploadFile } = require('../utils/supabase');
const aiService = require('../services/aiService');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Create Prisma client with explicit error handling
let prisma;
try {
  prisma = new PrismaClient();
  console.log('Prisma client created successfully');
} catch (error) {
  console.error('Failed to create Prisma client:', error);
  prisma = null;
}

// Test Prisma connection
async function testPrismaConnection() {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully');
    return true;
  } catch (error) {
    console.error('Prisma connection failed:', error);
    return false;
  }
}

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

const trackSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long')
});

// Upload track
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { title } = trackSchema.parse(req.body);
    
    // Save file
    const timestamp = Date.now();
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    const uploadsDir = path.join(__dirname, '../../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, req.file.buffer);

    // Upload to Supabase
    await uploadFile(req.file, fileName);

    // Create track
    const track = await prisma.track.create({
      data: {
        title,
        fileUrl: filePath,
        userId: req.user.id
      }
    });

    // Check if user has a trained model (check for model file)
    const modelsDir = path.join(__dirname, '../../models');
    const modelInfoPath = path.join(modelsDir, `user_${req.user.id}_info.json`);
    
    let predictions = [];
    let hasTrainedModel = false;
    
    try {
      const modelInfo = JSON.parse(await fs.readFile(modelInfoPath, 'utf8'));
      hasTrainedModel = modelInfo.accuracy > 0.3;
      console.log('Found trained model with accuracy:', modelInfo.accuracy);
    } catch (error) {
      console.log('No trained model found:', error.message);
    }

    if (hasTrainedModel) {
      try {
        console.log('Using personal model for predictions');
        predictions = await aiService.predictGenrePersonalFromFile(filePath, req.user.id);
        console.log('Personal predictions:', predictions);
      } catch (error) {
        console.error('Personal prediction failed:', error);
        console.error('Error details:', error.message);
        predictions = await aiService.predictGenreDefault(filePath);
      }
    } else {
      console.log('No personal model available, using default');
      predictions = await aiService.predictGenreDefault(filePath);
    }

    // Store predictions
    for (const prediction of predictions) {
      let tag = await prisma.tag.findUnique({
        where: { name: prediction.tag }
      });
      
      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: prediction.tag }
        });
      }
      
      await prisma.prediction.create({
        data: {
          trackId: track.id,
          tagId: tag.id,
          confidence: prediction.confidence
        }
      });
    }

    res.status(201).json({
      message: hasTrainedModel ? 'Track uploaded with personal AI predictions!' : 'Track uploaded successfully. Add custom tags to train your personal AI model!',
      track: { ...track, predictions }
    });
  } catch (error) {
    console.error('Track upload error:', error);
    res.status(500).json({ error: 'Failed to upload track' });
  }
});

// Get tracks
router.get('/my-tracks', auth, async (req, res) => {
  try {
    const tracks = await prisma.track.findMany({
      where: { userId: req.user.id },
      include: {
        predictions: {
          include: { tag: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ tracks });
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Add custom tag
router.post('/:id/tags', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    const track = await prisma.track.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    for (const tagName of tags) {
      let tag = await prisma.tag.findUnique({
        where: { name: tagName }
      });
      
      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName }
        });
      }
      
      await prisma.prediction.create({
        data: {
          confidence: 0.95,
          trackId: id,
          tagId: tag.id
        }
      });
    }

    res.json({ message: 'Custom tags added successfully' });
  } catch (error) {
    console.error('Add custom tag error:', error);
    res.status(500).json({ error: 'Failed to add custom tags' });
  }
});

// Train personal model - Simplified version
router.post('/train-personal-model', auth, async (req, res) => {
  try {
    console.log('=== TRAIN PERSONAL MODEL ===');
    console.log('User ID:', req.user.id);
    
    const tracks = await prisma.track.findMany({
      where: { userId: req.user.id },
      include: {
        predictions: {
          where: { confidence: { gte: 0.9 } },
          include: { tag: true }
        }
      }
    });

    console.log('Found tracks:', tracks.length);
    console.log('Tracks with predictions:', tracks.filter(t => t.predictions.length > 0).length);

    const tracksWithCustomTags = tracks.filter(track => track.predictions.length > 0);

    if (tracksWithCustomTags.length < 5) {
      return res.status(400).json({ 
        error: `Need at least 5 tracks with custom tags. You have ${tracksWithCustomTags.length}.` 
      });
    }

    const trainingData = tracksWithCustomTags.map(track => ({
      audioPath: track.fileUrl,
      tags: track.predictions.map(p => ({
        tag: p.tag.name,
        confidence: p.confidence
      }))
    }));

    console.log(`Training on ${trainingData.length} tracks`);
    console.log('Training data sample:', trainingData[0]);

    console.log('About to call aiService.trainPersonalModel...');
    const result = await aiService.trainPersonalModel(req.user.id, trainingData);
    console.log('Training result:', result);
    
    if (result.success) {
      console.log('Training successful!');
      
      // Store model info in a simple JSON file
      const modelInfo = {
        userId: req.user.id,
        accuracy: result.accuracy,
        lastTrained: new Date().toISOString(),
        tracksUsed: result.tracks_trained,
        uniqueTags: result.unique_tags
      };
      
      // Save to file
      const modelsDir = path.join(__dirname, '../../models');
      await fs.mkdir(modelsDir, { recursive: true });
      await fs.writeFile(
        path.join(modelsDir, `user_${req.user.id}_info.json`),
        JSON.stringify(modelInfo, null, 2)
      );
      
      res.json({
        success: true,
        message: 'Personal model trained and saved successfully!',
        accuracy: result.accuracy,
        tracksUsed: result.tracks_trained,
        uniqueTags: result.unique_tags
      });
    } else {
      console.error('Training failed:', result.error);
      res.status(500).json({ 
        error: result.error || 'Training failed',
        details: result
      });
    }
  } catch (error) {
    console.error('Training route error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Training failed', 
      details: error.message,
      stack: error.stack
    });
  }
});

// Debug route to check database
router.get('/debug-db', auth, async (req, res) => {
  try {
    console.log('=== DEBUG DATABASE ===');
    
    // Check if prisma is available
    console.log('Prisma available:', !!prisma);
    
    // Check if userModel table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Available tables:', tables);
    
    // Check if userModel exists
    const userModelExists = tables.some(t => t.table_name === 'user_models');
    console.log('user_models table exists:', userModelExists);
    
    res.json({
      prismaAvailable: !!prisma,
      tables: tables,
      userModelExists: userModelExists
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete track
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const track = await prisma.track.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    await prisma.prediction.deleteMany({
      where: { trackId: id }
    });

    await prisma.track.delete({
      where: { id }
    });

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

module.exports = router;
   