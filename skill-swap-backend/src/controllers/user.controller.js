// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// const updateProfile = async (req, res) => {
//   const userId = req.params.id;
//   const { location, profilePhoto, availability, isPublic } = req.body;

//   try {
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         location,
//         profilePhoto,
//         availability,
//         isPublic,
//       },
//     });

//     res.json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ message: "Profile update failed", error: err.message });
//   }
// };

// const getProfile = async (req, res) => {
//   const userId = req.params.id;

//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         location: true,
//         profilePhoto: true,
//         availability: true,
//         isPublic: true,
//         isBanned: true,
//         createdAt: true,
//       },
//     });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: "Get profile failed", error: err.message });
//   }
// };

// module.exports = { updateProfile, getProfile };
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        profilePhoto: true,
        availability: true,
        isPublic: true,
        isBanned: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Get profile failed", error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { location, profilePhoto, availability, isPublic } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        location,
        profilePhoto,
        availability,
        isPublic,
      },
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Profile update failed", error: err.message });
  }
};

module.exports = { getProfile, updateProfile };
