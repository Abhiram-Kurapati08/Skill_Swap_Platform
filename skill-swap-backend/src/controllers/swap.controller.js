const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSwap = async (req, res) => {
  const { requesterId, receiverId, skillOffered, skillWanted } = req.body;

  if (!requesterId || !receiverId || !skillOffered || !skillWanted) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const swap = await prisma.swap.create({
      data: {
        requesterId,
        receiverId,
        skillOffered,
        skillWanted,
      },
    });

    res.status(201).json(swap);
  } catch (err) {
    res.status(500).json({ message: "Swap creation failed", error: err.message });
  }
};

const updateSwapStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedSwap = await prisma.swap.update({
      where: { id },
      data: { status },
    });

    res.json(updatedSwap);
  } catch (err) {
    res.status(500).json({ message: "Swap status update failed", error: err.message });
  }
};

const getUserSwaps = async (req, res) => {
  const { userId } = req.params;

  try {
    const swaps = await prisma.swap.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(swaps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch swaps", error: err.message });
  }
};

module.exports = { createSwap, updateSwapStatus, getUserSwaps };
