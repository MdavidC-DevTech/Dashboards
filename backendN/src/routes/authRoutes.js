const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Si necesitas auth para /users/me, importas el middleware
const authMiddleware = require('../middleware/authMiddleware');
// Podrías crear un userController o manejar inline

// POST /auth/token (login)
router.post('/token', authController.login);
// GET /auth/users/me
router.get('/users/me', authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "No user data in token" });
  }
  return res.json({
    debugMiddleware: req.debugInfo, // Para ver el SECRET_KEY y lo verificado
    user: req.user,
    msg: "Hola, /users/me está funcionando"
  });
});



module.exports = router;
