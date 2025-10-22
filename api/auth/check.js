const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
  return requireAuth(req, res, () => {
    res.status(200).json({ 
      message: 'Authenticated',
      user: req.user
    });
  });
};