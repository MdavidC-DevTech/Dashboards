const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "Acceso denegado, token no proporcionado" });

  const token = authHeader.split(" ")[1]; // Asumiendo formato "Bearer TOKEN"
  if (!token) return res.status(401).json({ message: "Token inválido" });

  try {
    const verified = jwt.verify(token, process.env.SECRET_KEY);
    req.user = verified; // Por ejemplo, { id, username }
    next();
  } catch (err) {
    res.status(400).json({ message: "Token inválido" });
  }
};

module.exports = authMiddleware;
