const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const banUser = async (req, res) => {
  const { userId } = req.params;
  const { isBanned } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isBanned },
    });

    res.json({ message: `User ${isBanned ? "banned" : "unbanned"} successfully`, user: updated });
  } catch (err) {
    res.status(500).json({ message: "Ban action failed", error: err.message });
  }
};

const deleteSkill = async (req, res) => {
  const { skillId } = req.params;

  try {
    await prisma.skill.delete({ where: { id: skillId } });
    res.json({ message: "Skill deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete skill failed", error: err.message });
  }
};

const getAllSwaps = async (req, res) => {
  try {
    const swaps = await prisma.swap.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(swaps);
  } catch (err) {
    res.status(500).json({ message: "Failed to get swaps", error: err.message });
  }
};

const broadcastMessage = async (req, res) => {
  const { message } = req.body;
  // Simulated only: no real user notification system
  res.json({ message: `Broadcasted to platform: "${message}"` });
};

module.exports = { banUser, deleteSkill, getAllSwaps, broadcastMessage };
