const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Headers:', req.headers);
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Token:', token ? token.substring(0, 20) + '...' : 'None');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    console.log('Found user:', user ? { id: user.id, email: user.email } : 'None');

    if (!user) {
      console.log('Invalid token - user not found');
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    console.log('Auth successful for user:', user.email);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
