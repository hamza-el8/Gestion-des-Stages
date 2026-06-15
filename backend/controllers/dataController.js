const User = require("../models/User");
const Company = require("../models/Company");
const Offer = require("../models/Offer");
const Application = require("../models/Application");
const Internship = require("../models/Internship");
const Report = require("../models/Report");
const Evaluation = require("../models/Evaluation");
const Notification = require("../models/Notification");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Soutenance = require("../models/Soutenance");

// ========== USERS ==========
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, role, active, phone, city, filiere, level, bio, skills } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (name) user.name = name;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (filiere !== undefined) user.filiere = filiere;
    if (level !== undefined) user.level = level;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;

    await user.save();
    const updated = await User.findById(user._id).select("-password");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== COMPANIES ==========
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Entreprise non trouvée" });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return res.status(404).json({ message: "Entreprise non trouvée" });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: "Entreprise supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== OFFERS ==========
exports.getOffers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.filiere) filter.filiere = req.query.filiere;
    if (req.query.companyId) filter.companyId = req.query.companyId;
    const offers = await Offer.find(filter)
      .populate("companyId", "name logoColor industry city")
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("companyId", "name logoColor industry city email");
    if (!offer) return res.status(404).json({ message: "Offre non trouvée" });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    const populated = await Offer.findById(offer._id).populate("companyId", "name logoColor industry city");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("companyId", "name logoColor industry city");
    if (!offer) return res.status(404).json({ message: "Offre non trouvée" });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: "Offre supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== APPLICATIONS ==========
exports.getApplications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.companyId) filter.companyId = req.query.companyId;
    if (req.query.offerId) filter.offerId = req.query.offerId;
    const applications = await Application.find(filter)
      .populate("studentId", "name email avatarColor filiere phone")
      .populate("offerId", "title companyId")
      .populate("companyId", "name")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("studentId", "name email avatarColor filiere phone")
      .populate("offerId", "title")
      .populate("companyId", "name");
    if (!application) return res.status(404).json({ message: "Candidature non trouvée" });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const application = await Application.create(req.body);
    const populated = await Application.findById(application._id)
      .populate("studentId", "name email avatarColor filiere phone")
      .populate("offerId", "title")
      .populate("companyId", "name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("studentId", "name email avatarColor filiere phone")
      .populate("offerId", "title")
      .populate("companyId", "name");
    if (!application) return res.status(404).json({ message: "Candidature non trouvée" });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidature supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== INTERNSHIPS ==========
exports.getInternships = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.companyId) filter.companyId = req.query.companyId;
    if (req.query.supervisorId) filter.supervisorId = req.query.supervisorId;
    const internships = await Internship.find(filter)
      .populate("studentId", "name email avatarColor filiere")
      .populate("companyId", "name logoColor industry city")
      .populate("supervisorId", "name email avatarColor")
      .sort({ startDate: -1 });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate("studentId", "name email avatarColor filiere")
      .populate("companyId", "name logoColor industry city")
      .populate("supervisorId", "name email avatarColor");
    if (!internship) return res.status(404).json({ message: "Stage non trouvé" });
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createInternship = async (req, res) => {
  try {
    const internship = await Internship.create(req.body);
    const populated = await Internship.findById(internship._id)
      .populate("studentId", "name email avatarColor filiere")
      .populate("companyId", "name logoColor industry city")
      .populate("supervisorId", "name email avatarColor");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("studentId", "name email avatarColor filiere")
      .populate("companyId", "name logoColor industry city")
      .populate("supervisorId", "name email avatarColor");
    if (!internship) return res.status(404).json({ message: "Stage non trouvé" });
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteInternship = async (req, res) => {
  try {
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ message: "Stage supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== REPORTS ==========
exports.getReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.internshipId) filter.internshipId = req.query.internshipId;
    const reports = await Report.find(filter)
      .populate("studentId", "name email avatarColor")
      .populate("internshipId", "topic companyId")
      .sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("studentId", "name email avatarColor")
      .populate("internshipId", "topic companyId");
    if (!report) return res.status(404).json({ message: "Rapport non trouvé" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const report = await Report.create(req.body);
    const populated = await Report.findById(report._id)
      .populate("studentId", "name email avatarColor")
      .populate("internshipId", "topic companyId");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("studentId", "name email avatarColor")
      .populate("internshipId", "topic companyId");
    if (!report) return res.status(404).json({ message: "Rapport non trouvé" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Rapport supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== EVALUATIONS ==========
exports.getEvaluations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.internshipId) filter.internshipId = req.query.internshipId;
    if (req.query.evaluatorId) filter.evaluatorId = req.query.evaluatorId;
    const evaluations = await Evaluation.find(filter)
      .populate("evaluatorId", "name email avatarColor")
      .sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.create(req.body);
    const populated = await Evaluation.findById(evaluation._id)
      .populate("evaluatorId", "name email avatarColor");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== NOTIFICATIONS ==========
exports.getNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification non trouvée" });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== CONVERSATIONS ==========
exports.getConversations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) {
      filter.participantIds = req.query.userId;
    }
    const conversations = await Conversation.find(filter)
      .populate("participantIds", "name email avatarColor role")
      .sort({ createdAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create(req.body);
    const populated = await Conversation.findById(conversation._id)
      .populate("participantIds", "name email avatarColor role");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== MESSAGES ==========
exports.getMessages = async (req, res) => {
  try {
    const filter = {};
    if (req.query.conversationId) filter.conversationId = req.query.conversationId;
    const messages = await Message.find(filter)
      .populate("senderId", "name email avatarColor")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const message = await Message.create(req.body);
    const populated = await Message.findById(message._id)
      .populate("senderId", "name email avatarColor");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== SOUTENANCES ==========
exports.getSoutenances = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.internshipId) filter.internshipId = req.query.internshipId;
    const soutenances = await Soutenance.find(filter)
      .populate("studentId", "name email avatarColor filiere")
      .populate("internshipId", "topic companyId")
      .populate("juryIds", "name email avatarColor")
      .populate("presidentId", "name email avatarColor")
      .sort({ date: -1 });
    res.json(soutenances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSoutenance = async (req, res) => {
  try {
    const soutenance = await Soutenance.create(req.body);
    const populated = await Soutenance.findById(soutenance._id)
      .populate("studentId", "name email avatarColor filiere")
      .populate("internshipId", "topic companyId")
      .populate("juryIds", "name email avatarColor")
      .populate("presidentId", "name email avatarColor");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSoutenance = async (req, res) => {
  try {
    const soutenance = await Soutenance.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("studentId", "name email avatarColor filiere")
      .populate("internshipId", "topic companyId")
      .populate("juryIds", "name email avatarColor")
      .populate("presidentId", "name email avatarColor");
    if (!soutenance) return res.status(404).json({ message: "Soutenance non trouvée" });
    res.json(soutenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSoutenance = async (req, res) => {
  try {
    await Soutenance.findByIdAndDelete(req.params.id);
    res.json({ message: "Soutenance supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== DASHBOARD STATS ==========
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCompanies = await Company.countDocuments();
    const totalOffers = await Offer.countDocuments();
    const totalApplications = await Application.countDocuments();
    const activeInternships = await Internship.countDocuments({ status: "ongoing" });
    const completedInternships = await Internship.countDocuments({ status: "completed" });
    const totalInternships = await Internship.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: "pending" });

    res.json({
      totalUsers,
      totalStudents,
      totalCompanies,
      totalOffers,
      totalApplications,
      activeInternships,
      completedInternships,
      totalInternships,
      pendingApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};