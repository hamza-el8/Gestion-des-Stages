const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Aucun compte trouvé avec cet email." });
    }
    if (!user.active) {
      return res.status(401).json({ message: "Ce compte est désactivé." });
    }
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }
    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarColor: user.avatarColor,
        active: user.active,
        bio: user.bio,
        filiere: user.filiere,
        level: user.level,
        city: user.city,
        cvName: user.cvName,
        cvData: user.cvData,
        skills: user.skills,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, filiere, companyName, industry, city } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    let companyId = null;

    if (role === "company") {
      const company = await Company.create({
        name: companyName || name,
        industry: industry || "—",
        city: city || "—",
        address: "—",
        email: email,
        phone: phone,
        description: "",
        logoColor: "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
        partner: false,
      });
      companyId = company._id;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      avatarColor: "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"),
      active: true,
      city: role === "student" ? city : undefined,
      filiere: role === "student" ? filiere : undefined,
      level: role === "student" ? "Qualification (T1)" : undefined,
      skills: role === "student" ? [] : undefined,
      companyId,
    });

    if (role === "company" && companyId) {
      await Company.findByIdAndUpdate(companyId, { ownerUserId: user._id });
    }

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarColor: user.avatarColor,
        active: user.active,
        bio: user.bio,
        filiere: user.filiere,
        level: user.level,
        city: user.city,
        skills: user.skills,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city, bio, filiere, level, skills, cvName, cvData } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (bio !== undefined) user.bio = bio;
    if (filiere !== undefined && user.role === "student") user.filiere = filiere;
    if (level !== undefined && user.role === "student") user.level = level;
    if (skills !== undefined && user.role === "student") user.skills = skills;
    if (cvName !== undefined && user.role === "student") user.cvName = cvName;
    if (cvData !== undefined && user.role === "student") user.cvData = cvData;

    const updated = await user.save();
    res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      avatarColor: updated.avatarColor,
      active: updated.active,
      bio: updated.bio,
      filiere: updated.filiere,
      level: updated.level,
      city: updated.city,
      cvName: updated.cvName,
      cvData: updated.cvData,
      skills: updated.skills,
      companyId: updated.companyId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit faire au moins 6 caractères." });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};