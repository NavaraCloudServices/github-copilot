import express from 'express';
import multer from 'multer';
import { validateChallengesJSON } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

// Upload challenges JSON file
router.post('/challenges', upload.single('challenges'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let challengesData;
    try {
      challengesData = JSON.parse(req.file.buffer.toString());
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    // Validate challenges structure
    if (!validateChallengesJSON(challengesData)) {
      return res.status(400).json({ error: 'Invalid challenges format' });
    }

    logger.info('Challenges JSON uploaded and validated successfully');

    res.json({
      message: 'Challenges uploaded successfully',
      challenges: challengesData,
      metadata: {
        totalChallenges: challengesData.challenges?.length || 0,
        categories: challengesData.categories?.length || 0,
        totalPoints: challengesData.metadata?.total_points || 0
      }
    });
  } catch (err) {
    next(err);
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }
  }
  next(error);
});

export default router;