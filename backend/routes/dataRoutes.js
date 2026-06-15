const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getEvaluations,
  createEvaluation,
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getConversations,
  createConversation,
  getMessages,
  createMessage,
  getSoutenances,
  createSoutenance,
  updateSoutenance,
  deleteSoutenance,
  getStats,
} = require("../controllers/dataController");
const { protect, adminOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Stats
router.get("/stats", getStats);

// Users
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", adminOnly, updateUser);
router.delete("/users/:id", adminOnly, deleteUser);

// Companies
router.get("/companies", getCompanies);
router.get("/companies/:id", getCompanyById);
router.post("/companies", adminOnly, createCompany);
router.put("/companies/:id", adminOnly, updateCompany);
router.delete("/companies/:id", adminOnly, deleteCompany);

// Offers
router.get("/offers", getOffers);
router.get("/offers/:id", getOfferById);
router.post("/offers", createOffer);
router.put("/offers/:id", updateOffer);
router.delete("/offers/:id", adminOnly, deleteOffer);

// Applications
router.get("/applications", getApplications);
router.get("/applications/:id", getApplicationById);
router.post("/applications", createApplication);
router.put("/applications/:id", updateApplication);
router.delete("/applications/:id", adminOnly, deleteApplication);

// Internships
router.get("/internships", getInternships);
router.get("/internships/:id", getInternshipById);
router.post("/internships", adminOnly, createInternship);
router.put("/internships/:id", updateInternship);
router.delete("/internships/:id", adminOnly, deleteInternship);

// Reports
router.get("/reports", getReports);
router.get("/reports/:id", getReportById);
router.post("/reports", createReport);
router.put("/reports/:id", updateReport);
router.delete("/reports/:id", deleteReport);

// Evaluations
router.get("/evaluations", getEvaluations);
router.post("/evaluations", createEvaluation);

// Notifications
router.get("/notifications", getNotifications);
router.post("/notifications", createNotification);
router.put("/notifications/read-all", markAllNotificationsRead);
router.put("/notifications/:id/read", markNotificationRead);
router.delete("/notifications/:id", deleteNotification);

// Conversations
router.get("/conversations", getConversations);
router.post("/conversations", createConversation);

// Messages
router.get("/messages", getMessages);
router.post("/messages", createMessage);

// Soutenances
router.get("/soutenances", getSoutenances);
router.post("/soutenances", createSoutenance);
router.put("/soutenances/:id", updateSoutenance);
router.delete("/soutenances/:id", adminOnly, deleteSoutenance);

module.exports = router;