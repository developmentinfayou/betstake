import { Router } from 'express';
import { User, UserSettings, UserStats } from '@casino/database';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { SeedManager } from '@casino/fairness';
import { authenticate, generateToken, AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    const existing = await User.findOne({
      $or: [
        { email: body.email },
        { username: body.username },
      ],
    });

    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await User.create({
      username: body.username,
      email: body.email,
      passwordHash,
    });

    await UserSettings.create({ userId: user._id });
    await UserStats.create({ userId: user._id });
    await SeedManager.createSeedPair(user._id.toString());

    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await User.findOne({ email: body.email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isVip: user.isVip,
        isPremium: user.isPremium,
        level: user.level,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).lean();
    const settings = await UserSettings.findOne({ userId }).lean();
    const stats = await UserStats.findOne({ userId }).lean();

    return res.json({ ...user, settings, stats });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
