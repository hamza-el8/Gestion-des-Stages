const bcrypt = require("bcryptjs");
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

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const daysAhead = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const seedData = async () => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log("Données déjà présentes, seed ignoré.");
    return;
  }

  console.log("Création des données de démonstration...");

  const hash = await bcrypt.hash("demo1234", 10);

  // Users
  const users = await User.create([
    {
      _id: "507f1f77bcf86cd799439011",
      name: "Youssef El Amrani",
      email: "admin@stageflow.ma",
      password: hash,
      role: "admin",
      phone: "+212 661 112 233",
      avatarColor: "#4f46e5",
      city: "Casablanca",
      active: true,
    },
    {
      _id: "507f1f77bcf86cd799439012",
      name: "Salma Bennani",
      email: "salma@stageflow.ma",
      password: hash,
      role: "student",
      phone: "+212 662 445 566",
      avatarColor: "#ec4899",
      filiere: "Développement Digital",
      level: "Spécialisation (T2)",
      city: "Casablanca",
      bio: "Stagiaire passionnée par le full-stack JavaScript. À la recherche d'un stage en développement web.",
      skills: ["React", "Node.js", "TypeScript", "MongoDB", "UI Design"],
      active: true,
    },
    {
      _id: "507f1f77bcf86cd799439013",
      name: "Mehdi Tazi",
      email: "mehdi@stageflow.ma",
      password: hash,
      role: "student",
      phone: "+212 663 778 899",
      avatarColor: "#0ea5e9",
      filiere: "Infrastructure Digitale",
      level: "Qualification (T1)",
      city: "Rabat",
      skills: ["Linux", "Réseaux", "Docker", "Cisco"],
      active: true,
    },
    {
      _id: "507f1f77bcf86cd799439014",
      name: "Imane Fassi",
      email: "imane@stageflow.ma",
      password: hash,
      role: "student",
      phone: "+212 664 101 202",
      avatarColor: "#10b981",
      filiere: "Gestion des Entreprises",
      level: "Spécialisation (T2)",
      city: "Marrakech",
      skills: ["Management", "Comptabilité", "Excel", "Analyse"],
      active: true,
    },
    {
      _id: "507f1f77bcf86cd799439015",
      name: "Anas Cherkaoui",
      email: "anas@stageflow.ma",
      password: hash,
      role: "student",
      avatarColor: "#f59e0b",
      filiere: "Développement Digital",
      level: "Qualification (T1)",
      city: "Tanger",
      skills: ["JavaScript", "Vue.js", "PHP", "MySQL"],
      active: true,
    },
    {
      _id: "507f1f77bcf86cd799439016",
      name: "Khadija Idrissi",
      email: "khadija@stageflow.ma",
      password: hash,
      role: "student",
      avatarColor: "#8b5cf6",
      filiere: "Marketing Digital",
      level: "Spécialisation (T2)",
      city: "Casablanca",
      skills: ["SEO", "Content", "Google Ads", "Analytics"],
      active: true,
    },
    {
      _id: "507f1f77bcf86cd799439017",
      name: "Pr. Nadia Berrada",
      email: "nadia@stageflow.ma",
      password: hash,
      role: "supervisor",
      phone: "+212 665 303 404",
      avatarColor: "#14b8a6",
      filiere: "Développement Digital",
      bio: "Formatrice responsable des stages en développement digital.",
      active: true,
    },
    {
      _id: "507f1f77bcf86cd799439018",
      name: "Pr. Karim Lahlou",
      email: "karim@stageflow.ma",
      password: hash,
      role: "supervisor",
      phone: "+212 666 505 606",
      avatarColor: "#f97316",
      filiere: "Infrastructure Digitale",
      active: true,
    },
    {
      _id: "507f1f77bcf86cd799439019",
      name: "RIH - Atos Maroc",
      email: "atos@stageflow.ma",
      password: hash,
      role: "company",
      phone: "+212 522 220 110",
      avatarColor: "#3b82f6",
      companyId: "507f1f77bcf86cd799439001",
      active: true,
    },
    {
      _id: "507f1f77bcf86cd79943901a",
      name: "Resp. RH - Inwi",
      email: "inwi@stageflow.ma",
      password: hash,
      role: "company",
      phone: "+212 537 710 220",
      avatarColor: "#6366f1",
      companyId: "507f1f77bcf86cd799439002",
      active: true,
    },
    {
      _id: "507f1f77bcf86cd79943901b",
      name: "Resp. Stage - OCP Group",
      email: "ocp@stageflow.ma",
      password: hash,
      role: "company",
      phone: "+212 522 550 330",
      avatarColor: "#0f766e",
      companyId: "507f1f77bcf86cd799439003",
      active: true,
    },
    {
      _id: "507f1f77bcf86cd79943901c",
      name: "RH - Capgemini Maroc",
      email: "capgemini@stageflow.ma",
      password: hash,
      role: "company",
      phone: "+212 537 600 440",
      avatarColor: "#0ea5e9",
      companyId: "507f1f77bcf86cd799439004",
      active: true,
    },
  ]);

  console.log("✓ Utilisateurs créés");

  // Companies
  const companies = await Company.create([
    {
      _id: "507f1f77bcf86cd799439001",
      name: "Atos Maroc",
      industry: "Services IT & Cloud",
      city: "Casablanca",
      address: "Twin Center, Bd Zerktouni, Casablanca",
      website: "https://atos.net",
      email: "rh@atos.ma",
      phone: "+212 522 220 110",
      description: "Leader mondial de la transformation digitale, présent à Casablanca depuis 2008.",
      logoColor: "#3b82f6",
      ownerUserId: "507f1f77bcf86cd799439019",
      partner: true,
    },
    {
      _id: "507f1f77bcf86cd799439002",
      name: "Inwi",
      industry: "Télécommunications",
      city: "Rabat",
      address: "Av. Allal El Fassi, Madinat Al Irfane, Rabat",
      website: "https://www.inwi.ma",
      email: "stage@inwi.ma",
      phone: "+212 537 710 220",
      description: "Troisième opérateur télécom au Maroc, filiale du groupe SNI.",
      logoColor: "#6366f1",
      ownerUserId: "507f1f77bcf86cd79943901a",
      partner: true,
    },
    {
      _id: "507f1f77bcf86cd799439003",
      name: "OCP Group",
      industry: "Industrie & Mines",
      city: "Casablanca",
      address: "Lot 6, Hay El Makhzen, Casablanca",
      website: "https://www.ocpgroup.ma",
      email: "stage@ocp.ma",
      phone: "+212 522 550 330",
      description: "Leader mondial des roches phosphatées et de la fertilisation.",
      logoColor: "#0f766e",
      ownerUserId: "507f1f77bcf86cd79943901b",
      partner: true,
    },
    {
      _id: "507f1f77bcf86cd799439004",
      name: "Capgemini Maroc",
      industry: "Conseil & Technologie",
      city: "Rabat",
      address: "Rue d'Alger, Rabat",
      website: "https://www.capgemini.com",
      email: "rh@capgemini.ma",
      phone: "+212 537 600 440",
      description: "Cabinet mondial de conseil en transformation numérique et ingénierie.",
      logoColor: "#0ea5e9",
      ownerUserId: "507f1f77bcf86cd79943901c",
      partner: true,
    },
    {
      _id: "507f1f77bcf86cd799439005",
      name: "Maroc Telecom",
      industry: "Télécommunications",
      city: "Rabat",
      address: "Av. Annakhil, Hay Riad, Rabat",
      website: "https://www.iam.ma",
      email: "stage@iam.ma",
      phone: "+212 537 718 800",
      description: "Premier opérateur global de télécommunications au Maroc.",
      logoColor: "#1d4ed8",
      ownerUserId: "",
      partner: false,
    },
  ]);

  console.log("✓ Entreprises créées");

  // Offers
  await Offer.create([
    {
      companyId: "507f1f77bcf86cd799439001",
      title: "Stage - Développeur Web Full-Stack (React/Node)",
      description: "Rejoignez l'équipe Plateforme pour développer des applications internes en React et Node.js. Vous participerez au cycle complet : conception, développement, tests et déploiement.",
      filiere: "Développement Digital",
      durationWeeks: 8,
      city: "Casablanca",
      paid: true,
      remote: false,
      skills: ["React", "Node.js", "TypeScript"],
      status: "open",
      createdAt: daysAgo(14),
    },
    {
      companyId: "507f1f77bcf86cd799439002",
      title: "Stage - Admin Système & Réseaux Junior",
      description: "Au sein de la DSI Inwi, vous assisterez l'équipe infrastructure dans l'administration des serveurs Linux, le monitoring et le déploiement conteneurisé.",
      filiere: "Infrastructure Digitale",
      durationWeeks: 6,
      city: "Rabat",
      paid: true,
      remote: false,
      skills: ["Linux", "Docker", "Réseaux"],
      status: "open",
      createdAt: daysAgo(10),
    },
    {
      companyId: "507f1f77bcf86cd799439003",
      title: "Stage - Assistant Gestion de Projet",
      description: "Stage au sein du département Projets digitaux d'OCP. Suivi de planning, reporting, coordination entre équipes techniques et métiers.",
      filiere: "Gestion des Entreprises",
      durationWeeks: 10,
      city: "Casablanca",
      paid: true,
      remote: true,
      skills: ["Management", "Excel", "Analyse"],
      status: "open",
      createdAt: daysAgo(7),
    },
    {
      companyId: "507f1f77bcf86cd799439004",
      title: "Stage - Développeur Front-End Angular",
      description: "Capgemini Maroc recherche un stagiaire pour rejoindre un projet client bancaire. Migration d'une application vers Angular 17.",
      filiere: "Développement Digital",
      durationWeeks: 12,
      city: "Rabat",
      paid: true,
      remote: false,
      skills: ["JavaScript", "Angular", "HTML/CSS"],
      status: "open",
      createdAt: daysAgo(5),
    },
    {
      companyId: "507f1f77bcf86cd799439001",
      title: "Stage - Marketing Digital & Growth",
      description: "Élaborez et animez la stratégie de contenu, SEO et campagnes d'acquisition pour nos produits SaaS.",
      filiere: "Marketing Digital",
      durationWeeks: 8,
      city: "Casablanca",
      paid: false,
      remote: true,
      skills: ["SEO", "Google Ads", "Content"],
      status: "open",
      createdAt: daysAgo(3),
    },
    {
      companyId: "507f1f77bcf86cd799439003",
      title: "Stage - Data Analyst (Power BI)",
      description: "Analyse de données opérationnelles et création de tableaux de bord décisionnels sous Power BI.",
      filiere: "Développement Digital",
      durationWeeks: 9,
      city: "Casablanca",
      paid: true,
      remote: false,
      skills: ["SQL", "Power BI", "Analyse"],
      status: "open",
      createdAt: daysAgo(2),
    },
    {
      companyId: "507f1f77bcf86cd799439004",
      title: "Stage - DevOps & CI/CD",
      description: "Mise en place de pipelines CI/CD, automatisation et culture DevOps sur des projets cloud.",
      filiere: "Infrastructure Digitale",
      durationWeeks: 8,
      city: "Rabat",
      paid: true,
      remote: true,
      skills: ["Docker", "Linux", "Git"],
      status: "closed",
      createdAt: daysAgo(30),
    },
  ]);

  console.log("✓ Offres créées");

  // Applications
  await Application.create([
    {
      offerId: "507f1f77bcf86cd799439101",
      studentId: "507f1f77bcf86cd799439012",
      companyId: "507f1f77bcf86cd799439001",
      coverLetter: "Je suis très intéressée par votre offre. Mon profil full-stack React/Node correspond parfaitement à vos besoins.",
      status: "accepted",
      createdAt: daysAgo(12),
    },
    {
      offerId: "507f1f77bcf86cd799439102",
      studentId: "507f1f77bcf86cd799439013",
      companyId: "507f1f77bcf86cd799439002",
      coverLetter: "Passionné par l'administration système Linux, je souhaite rejoindre votre équipe DSI.",
      status: "accepted",
      createdAt: daysAgo(9),
    },
    {
      offerId: "507f1f77bcf86cd799439101",
      studentId: "507f1f77bcf86cd799439015",
      companyId: "507f1f77bcf86cd799439001",
      coverLetter: "Étudiant en développement, je maîtrise JavaScript et Vue.js. Disponible immédiatement.",
      status: "pending",
      createdAt: daysAgo(4),
    },
    {
      offerId: "507f1f77bcf86cd799439106",
      studentId: "507f1f77bcf86cd799439012",
      companyId: "507f1f77bcf86cd799439003",
      coverLetter: "Curieuse de data, j'aimerais monter en compétences sur Power BI.",
      status: "pending",
      createdAt: daysAgo(2),
    },
    {
      offerId: "507f1f77bcf86cd799439103",
      studentId: "507f1f77bcf86cd799439014",
      companyId: "507f1f77bcf86cd799439003",
      coverLetter: "En spécialisation gestion, ce stage correspond à mon projet professionnel.",
      status: "rejected",
      createdAt: daysAgo(6),
    },
    {
      offerId: "507f1f77bcf86cd799439105",
      studentId: "507f1f77bcf86cd799439016",
      companyId: "507f1f77bcf86cd799439001",
      coverLetter: "Spécialisée en marketing digital, je souhaite mettre en pratique mes compétences SEO.",
      status: "pending",
      createdAt: daysAgo(1),
    },
  ]);

  console.log("✓ Candidatures créées");

  // Internships
  const internships = await Internship.create([
    {
      studentId: "507f1f77bcf86cd799439012",
      companyId: "507f1f77bcf86cd799439001",
      offerId: "507f1f77bcf86cd799439101",
      supervisorId: "507f1f77bcf86cd799439017",
      topic: "Plateforme interne de gestion des demandes (React + Node.js)",
      companyMentor: "Hicham Naciri",
      status: "ongoing",
      startDate: daysAgo(28),
      endDate: daysAhead(28),
      hoursPerWeek: 40,
    },
    {
      studentId: "507f1f77bcf86cd799439013",
      companyId: "507f1f77bcf86cd799439002",
      offerId: "507f1f77bcf86cd799439102",
      supervisorId: "507f1f77bcf86cd799439018",
      topic: "Conteneurisation et monitoring de l'infrastructure DSI",
      companyMentor: "Sara Mounir",
      status: "ongoing",
      startDate: daysAgo(20),
      endDate: daysAhead(22),
      hoursPerWeek: 35,
    },
    {
      studentId: "507f1f77bcf86cd799439014",
      companyId: "507f1f77bcf86cd799439004",
      supervisorId: "507f1f77bcf86cd799439017",
      topic: "Étude de marché et lancement produit",
      companyMentor: "Omar Belkadi",
      status: "completed",
      startDate: daysAgo(120),
      endDate: daysAgo(30),
      hoursPerWeek: 40,
    },
  ]);

  console.log("✓ Stages créés");

  // Reports
  await Report.create([
    {
      internshipId: internships[0]._id,
      studentId: "507f1f77bcf86cd799439012",
      type: "weekly",
      title: "Semaine 3 — Authentification & maquettes",
      date: daysAgo(7),
      content: "Mise en place de l'authentification JWT côté backend (Node/Express). Création des maquettes Figma des écrans principaux. Début des composants React.",
      status: "approved",
      feedback: "Très bon avancement. Pense à documenter l'API avec Swagger.",
    },
    {
      internshipId: internships[0]._id,
      studentId: "507f1f77bcf86cd799439012",
      type: "weekly",
      title: "Semaine 4 — Composants & intégration",
      date: daysAgo(1),
      content: "Développement des composants React (Dashboard, Formulaires). Connexion à l'API REST. Gestion des erreurs et états de chargement.",
      status: "submitted",
    },
    {
      internshipId: internships[1]._id,
      studentId: "507f1f77bcf86cd799439013",
      type: "weekly",
      title: "Semaine 2 — Environnement Docker",
      date: daysAgo(2),
      content: "Déploiement de l'environnement Docker de test. Configuration du monitoring Prometheus/Grafana.",
      status: "submitted",
    },
    {
      internshipId: internships[1]._id,
      studentId: "507f1f77bcf86cd799439013",
      type: "daily",
      title: "Jour J-2 — Script d'automatisation",
      date: daysAgo(2),
      content: "Rédaction d'un script Bash pour automatiser les sauvegardes.",
      status: "draft",
    },
    {
      internshipId: internships[2]._id,
      studentId: "507f1f77bcf86cd799439014",
      type: "weekly",
      title: "Semaine finale — Restitution",
      date: daysAgo(35),
      content: "Finalisation du rapport et préparation de la présentation.",
      status: "approved",
      feedback: "Excellent travail de synthèse.",
    },
  ]);

  console.log("✓ Rapports créés");

  // Evaluations
  await Evaluation.create([
    {
      internshipId: internships[0]._id,
      type: "midterm",
      score: 16,
      criteria: [
        { label: "Technique", value: 16 },
        { label: "Autonomie", value: 17 },
        { label: "Communication", value: 15 },
        { label: "Assiduité", value: 18 },
      ],
      comment: "Bonne progression technique. Salma montre une réelle autonomie.",
      evaluatorId: "507f1f77bcf86cd799439017",
    },
    {
      internshipId: internships[2]._id,
      type: "final",
      score: 17,
      criteria: [
        { label: "Technique", value: 16 },
        { label: "Autonomie", value: 18 },
        { label: "Communication", value: 17 },
        { label: "Assiduité", value: 18 },
      ],
      comment: "Stage réussi, livrables de qualité. Félicitations.",
      evaluatorId: "507f1f77bcf86cd799439017",
    },
  ]);

  console.log("✓ Évaluations créées");

  // Notifications
  await Notification.create([
    {
      userId: "507f1f77bcf86cd799439012",
      title: "Rapport en attente de validation",
      message: "Votre rapport « Semaine 4 » a été soumis à votre encadrant.",
      read: false,
      type: "report",
      createdAt: daysAgo(1),
    },
    {
      userId: "507f1f77bcf86cd799439012",
      title: "Évaluation intermédiaire disponible",
      message: "Votre encadrant a publié votre évaluation intermédiaire : 16/20.",
      read: false,
      type: "eval",
      createdAt: daysAgo(7),
    },
    {
      userId: "507f1f77bcf86cd799439017",
      title: "Nouveau rapport à valider",
      message: "Salma Bennani a soumis son rapport de semaine 4.",
      read: false,
      type: "report",
      createdAt: daysAgo(1),
    },
    {
      userId: "507f1f77bcf86cd799439019",
      title: "Nouvelle candidature",
      message: "Anas Cherkaoui a postulé à votre offre Développeur Web Full-Stack.",
      read: false,
      type: "application",
      createdAt: daysAgo(4),
    },
    {
      userId: "507f1f77bcf86cd799439011",
      title: "Nouvelle entreprise inscrite",
      message: "Capgemini Maroc a rejoint la plateforme en tant que partenaire.",
      read: true,
      type: "info",
      createdAt: daysAgo(260),
    },
  ]);

  console.log("✓ Notifications créées");

  // Conversations
  const conv1 = await Conversation.create({
    participantIds: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439017"],
    type: "student-supervisor",
    internshipId: internships[0]._id,
  });

  const conv2 = await Conversation.create({
    participantIds: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439019"],
    type: "student-company",
    internshipId: internships[0]._id,
  });

  console.log("✓ Conversations créées");

  // Messages
  await Message.create([
    {
      conversationId: conv1._id,
      senderId: "507f1f77bcf86cd799439017",
      text: "Bonjour Salma, comment se passe ta première semaine de stage ?",
      createdAt: daysAgo(27),
    },
    {
      conversationId: conv1._id,
      senderId: "507f1f77bcf86cd799439012",
      text: "Très bien Pr. Berrada ! J'ai mis en place l'authentification et commencé les maquettes.",
      createdAt: daysAgo(26),
    },
    {
      conversationId: conv1._id,
      senderId: "507f1f77bcf86cd799439017",
      text: "Parfait. Pense à documenter l'API. Bon courage !",
      createdAt: daysAgo(26),
    },
    {
      conversationId: conv2._id,
      senderId: "507f1f77bcf86cd799439019",
      text: "Bienvenue chez Atos ! Ton tuteur Hicham t'attendra lundi à 9h.",
      createdAt: daysAgo(27),
    },
    {
      conversationId: conv2._id,
      senderId: "507f1f77bcf86cd799439012",
      text: "Merci beaucoup, hâte de commencer !",
      createdAt: daysAgo(27),
    },
  ]);

  console.log("✓ Messages créés");

  // Soutenances
  await Soutenance.create([
    {
      internshipId: internships[2]._id,
      studentId: "507f1f77bcf86cd799439014",
      date: daysAgo(30),
      time: "10:00",
      room: "Salle de conférence A",
      juryIds: ["507f1f77bcf86cd799439017", "507f1f77bcf86cd799439011"],
      presidentId: "507f1f77bcf86cd799439017",
      grade: 17,
      status: "done",
      notes: "Excellente présentation, maîtrise du sujet.",
    },
    {
      internshipId: internships[0]._id,
      studentId: "507f1f77bcf86cd799439012",
      date: daysAhead(26),
      time: "14:00",
      room: "Salle B204",
      juryIds: ["507f1f77bcf86cd799439017", "507f1f77bcf86cd799439011"],
      presidentId: "507f1f77bcf86cd799439011",
      status: "scheduled",
    },
  ]);

  console.log("✓ Soutenances créées");
  console.log("✅ DONNÉES DE DÉMONSTRATION CRÉÉES AVEC SUCCÈS !");
};

module.exports = seedData;