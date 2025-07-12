const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const isAdmin = async (req, res, next) => {
  const userId = req.headers['x-user-id']; // Simulated for hackathon

  if (!userId) return res.status(403).json({ message: "Missing admin ID" });

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  req.adminId = userId;
  next();
};

module.exports = isAdmin;
