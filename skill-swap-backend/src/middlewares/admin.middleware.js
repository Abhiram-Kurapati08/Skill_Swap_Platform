// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// const isAdmin = async (req, res, next) => {
//   const userId = req.headers['x-user-id']; // Simulated for hackathon

//   if (!userId) return res.status(403).json({ message: "Missing admin ID" });

//   const user = await prisma.user.findUnique({ where: { id: userId } });

//   if (!user || user.role !== "ADMIN") {
//     return res.status(403).json({ message: "Access denied: Admins only" });
//   }

//   req.adminId = userId;
//   next();
// };

// module.exports = isAdmin;
// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// const protect = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) return res.status(401).json({ message: "No token, unauthorized" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await prisma.user.findUnique({ where: { id: decoded.id } });

//     if (!req.user) return res.status(401).json({ message: "User not found" });

//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Token invalid", error: err.message });
//   }
// };

// module.exports = { protect };
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const isAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

module.exports = { isAdmin };
