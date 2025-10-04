import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { authenticate, authorizePartner, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const partners = await User.find({ role: 'partner' }).select('-password');
    res.json({ partners });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: 'Server error fetching partners' });
  }
});

router.get('/available', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const partners = await User.find({ role: 'partner', isAvailable: true }).select(
      '-password'
    );
    res.json({ partners });
  } catch (error) {
    console.error('Get available partners error:', error);
    res.status(500).json({ error: 'Server error fetching available partners' });
  }
});

router.put(
  '/availability',
  authenticate,
  authorizePartner,
  [body('isAvailable').isBoolean().withMessage('Valid availability status is required')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const user = await User.findByIdAndUpdate(
        req.user!.id,
        { isAvailable: req.body.isAvailable },
        { new: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        message: 'Availability updated successfully',
        user,
      });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({ error: 'Server error updating availability' });
    }
  }
);

export default router;
