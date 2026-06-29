export type UserRole = "Citizen" | "Admin" | "Authority";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  profileImage: string;
  address: string;
  city: string;
  state: string;
  points: number;
  badges: string[];
  role: UserRole;
  createdAt: string;
}

export type IssueCategory =
  | "Pothole"
  | "Garbage"
  | "Broken Streetlight"
  | "Water Leakage"
  | "Drainage Blockage"
  | "Illegal Dumping"
  | "Road Damage"
  | "Traffic Signal"
  | "Tree Fallen"
  | "Public Toilet Damage"
  | "Broken Sidewalk"
  | "Flooding"
  | "Others";

export type IssueSeverity = "Low" | "Medium" | "High" | "Critical";

export type IssueStatus =
  | "Reported"
  | "AI Analysed"
  | "Community Verified"
  | "Assigned"
  | "Accepted"
  | "In Progress"
  | "Resolved"
  | "Closed"
  | "Rejected";

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  predictedCategory?: string;
  severity: IssueSeverity;
  status: IssueStatus;
  images: string[];
  videos?: string[];
  latitude: number;
  longitude: number;
  address: string;
  reporterId: string;
  reporterName?: string;
  assignedAuthority?: string; // ID or name of the authority department
  verificationCount: number;
  duplicateScore?: number;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
  resolutionProof?: string; // base64 or placeholder URL
  beforeAfterImage?: string; // base64 or placeholder URL
  estimatedCompletionTime?: string;
}

export interface Comment {
  _id: string;
  issueId: string;
  userId: string;
  userName: string;
  userImage: string;
  userRole: UserRole;
  comment: string;
  createdAt: string;
}

export interface Verification {
  _id: string;
  issueId: string;
  userId: string;
  vote: "up" | "down";
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Achievement {
  _id: string;
  userId: string;
  badge: string;
  points: number;
  earnedAt: string;
}

export const ISSUE_CATEGORIES: IssueCategory[] = [
  "Pothole",
  "Garbage",
  "Broken Streetlight",
  "Water Leakage",
  "Drainage Blockage",
  "Illegal Dumping",
  "Road Damage",
  "Traffic Signal",
  "Tree Fallen",
  "Public Toilet Damage",
  "Broken Sidewalk",
  "Flooding",
  "Others"
];

export const ISSUE_STATUSES: IssueStatus[] = [
  "Reported",
  "AI Analysed",
  "Community Verified",
  "Assigned",
  "Accepted",
  "In Progress",
  "Resolved",
  "Closed",
  "Rejected"
];

export const DEPARTMENT_ROUTING: Record<IssueCategory, string> = {
  Pothole: "Road Authority",
  Garbage: "Sanitation Department",
  "Broken Streetlight": "Electric Department",
  "Water Leakage": "Water Board",
  "Drainage Blockage": "Water Board",
  "Illegal Dumping": "Sanitation Department",
  "Road Damage": "Road Authority",
  "Traffic Signal": "Traffic Command",
  "Tree Fallen": "Disaster Response",
  "Public Toilet Damage": "Municipal Maintenance",
  "Broken Sidewalk": "Road Authority",
  Flooding: "Disaster Response",
  Others: "General Administration"
};

export interface LeaderboardEntry {
  userId: string;
  name: string;
  profileImage: string;
  points: number;
  rank: number;
  badgesCount: number;
}
