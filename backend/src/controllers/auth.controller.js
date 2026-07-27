const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { sendMail, welcomeEmail } = require("../services/mail.service");
const { asyncHandler } = require("../middleware/asyncHandler");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "email, password et name sont requis" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ message: "Cet email est déjà utilisé" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashed,
      name,
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  sendMail(welcomeEmail(user));

  const token = signToken(user);
  return res.status(201).json({
    message: "Inscription réussie",
    token,
    user: publicUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email et password sont requis" });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.status(401).json({ message: "Identifiants invalides" });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Identifiants invalides" });
  }

  const token = signToken(user);
  return res.json({
    message: "Connexion réussie",
    token,
    user: publicUser(user),
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
  return res.json({ user: publicUser(user) });
});

module.exports = { register, login, me };
