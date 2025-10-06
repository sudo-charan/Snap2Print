import { Router } from 'express';
import { db } from '../services/database';
import { CreateShopRequest } from '../models/types';

const router = Router();

// GET /api/shops - Get all shops (for testing)
router.get('/', async (req, res) => {
  try {
    const shops = await db.getAllShops();
    res.json(shops);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// GET /api/shops/:shopId - Get specific shop
router.get('/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await db.getShop(shopId);

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json(shop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
});

// POST /api/shops - Create new shop
router.post('/', async (req, res) => {
  try {
    const shopData: CreateShopRequest = req.body;

    // Generate unique shop ID
    const shopId = `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const shop = await db.createShop({
      shopId,
      ...shopData
    });

    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shop' });
  }
});

// PUT /api/shops/:shopId - Update shop
router.put('/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const updates = req.body;

    const shop = await db.updateShop(shopId, updates);

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json(shop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shop' });
  }
});

// DELETE /api/shops/:shopId - Delete shop
router.delete('/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const deleted = await db.deleteShop(shopId);

    if (!deleted) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shop' });
  }
});

export default router;
