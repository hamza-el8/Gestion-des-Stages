export type Role = "admin" | "student" | "supervisor" | "company";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  avatarColor: string;
  createdAt: string;
  active: boolean;

  // Student
  bio?: string;
  filiere?: string;
  level?: string;
  city?: string;
  cvName?: string;
  cvData?: string; // data URL
  skills?: string[];

  // Company user
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  city: string;
  address: string;
  website?: string;
  email: string;
  phone?: string;
  description?: string;
  logoColor: string;
  ownerUserId: string;
  partner: boolean;
  createdAt: string;
}

export interface Offer {
  id: string;
  companyId: string;
  title: string;
  description: string;
  filiere: string;
  durationWeeks: number;
  city: string;
  paid: boolean;
  remote: boolean;
  skills: string[];
  status: "open" | "closed";
  createdAt: string;
}

export interface Application {
  id: string;
  offerId: string;
  studentId: string;
  companyId: string;
  coverLetter: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Internship {
  id: string;
  studentId: string;
  companyId: string;
  offerId?: string;
  supervisorId: string;
  topic: string;
  companyMentor?: string;
  status: "ongoing" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  createdAt: string;
}

export interface Report {
  id: string;
  internshipId: string;
  studentId: string;
  type: "daily" | "weekly";
  title: string;
  date: string;
  content: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  feedback?: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  internshipId: string;
  type: "midterm" | "final";
  score: number; // /20
  criteria: { label: string; value: number }[];
  comment: string;
  evaluatorId: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "info" | "success" | "warning" | "application" | "report" | "eval" | "soutenance";
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  type: "student-supervisor" | "student-company";
  internshipId?: string;
  createdAt: string;
}

export interface Soutenance {
  id: string;
  internshipId: string;
  studentId: string;
  date: string;
  time: string;
  room: string;
  juryIds: string[];
  presidentId?: string;
  grade?: number; // /20
  status: "scheduled" | "done" | "cancelled";
  notes?: string;
}

export interface DB {
  users: User[];
  companies: Company[];
  offers: Offer[];
  applications: Application[];
  internships: Internship[];
  reports: Report[];
  evaluations: Evaluation[];
  notifications: AppNotification[];
  conversations: Conversation[];
  messages: Message[];
  soutenances: Soutenance[];
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}
