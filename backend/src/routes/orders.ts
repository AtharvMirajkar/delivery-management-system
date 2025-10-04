import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order';
import User from '../models/User';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('customerPhone').trim().notEmpty().withMessage('Customer phone is required'),
    body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
    body('pickupLocation.lat').isFloat().withMessage('Valid pickup latitude is required'),
    body('pickupLocation.lng').isFloat().withMessage('Valid pickup longitude is required'),
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
    body('deliveryLocation.lat').isFloat().withMessage('Valid delivery latitude is required'),
    body('deliveryLocation.lng').isFloat().withMessage('Valid delivery longitude is required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const order = new Order({
        orderNumber,
        ...req.body,
      });

      await order.save();

      res.status(201).json({
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Server error creating order' });
    }
  }
);

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, id } = req.user!;

    let query = {};
    if (role === 'partner') {
      query = { assignedTo: id };
    }

    const orders = await Order.find(query)
      .populate('assignedTo', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'assignedTo',
      'name email phone'
    );

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (req.user!.role === 'partner' && order.assignedTo?.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error fetching order' });
  }
});

router.put(
  '/:id/assign',
  authenticate,
  authorizeAdmin,
  [body('partnerId').notEmpty().withMessage('Partner ID is required')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { partnerId } = req.body;

      const partner = await User.findOne({ _id: partnerId, role: 'partner' });
      if (!partner) {
        res.status(404).json({ error: 'Partner not found' });
        return;
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { assignedTo: partnerId, status: 'assigned' },
        { new: true }
      ).populate('assignedTo', 'name email phone');

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.json({
        message: 'Order assigned successfully',
        order,
      });
    } catch (error) {
      console.error('Assign order error:', error);
      res.status(500).json({ error: 'Server error assigning order' });
    }
  }
);

router.put(
  '/:id/status',
  authenticate,
  [body('status').isIn(['picked_up', 'delivered']).withMessage('Valid status is required')],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (req.user!.role === 'partner' && order.assignedTo?.toString() !== req.user!.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      order.status = req.body.status;
      await order.save();

      res.json({
        message: 'Order status updated successfully',
        order,
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Server error updating order status' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ error: 'Server error deleting order' });
    }
  }
);

export default router;
