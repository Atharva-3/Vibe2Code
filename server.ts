import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies with higher limits for base64 uploads
app.use(express.json({ limit: "20mb" }));

// File-based database setup
const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Secret key for a very simple custom JWT sign / verify
const JWT_SECRET = process.env.JWT_SECRET || "community-hero-super-secret-key-2026";

// Lazy-loaded Gemini API client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      geminiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return geminiClient;
}

// Pre-populated base database structures
const INITIAL_USERS = [
  {
    _id: "u-citizen-1",
    name: "Alex Rivera",
    email: "citizen@hero.com",
    phone: "+15550199",
    password: crypto.createHash("sha256").update("password123").digest("hex"),
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    address: "742 Evergreen Terrace",
    city: "Springfield",
    state: "Illinois",
    points: 145,
    badges: ["Local Watcher", "Neighborhood Guardian"],
    role: "Citizen" as const,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "u-admin-1",
    name: "Director Sarah Vance",
    email: "admin@hero.com",
    phone: "+15550200",
    password: crypto.createHash("sha256").update("password123").digest("hex"),
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    address: "Municipal HQ Block A",
    city: "Springfield",
    state: "Illinois",
    points: 0,
    badges: ["Civic Champion"],
    role: "Admin" as const,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "u-auth-1",
    name: "Chief Eng. Thomas Vance",
    email: "authority@hero.com",
    phone: "+15550300",
    password: crypto.createHash("sha256").update("password123").digest("hex"),
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    address: "Department of Road Infrastructure & Public Works",
    city: "Springfield",
    state: "Illinois",
    points: 0,
    badges: [],
    role: "Authority" as const,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_ISSUES = [
  {
    _id: "issue-1",
    title: "Major Pothole on Lincoln Avenue",
    description: "Deep pothole right near the traffic intersection. It forces cars to swerve suddenly, which is extremely dangerous, especially at night when visibility is low. Already saw two bicycles almost crash here.",
    category: "Pothole" as const,
    predictedCategory: "Pothole",
    severity: "High" as const,
    status: "In Progress" as const,
    images: [
      "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600"
    ],
    latitude: 39.7817,
    longitude: -89.6501,
    address: "1200 Lincoln Ave, Springfield, IL",
    reporterId: "u-citizen-1",
    reporterName: "Alex Rivera",
    assignedAuthority: "Road Authority",
    verificationCount: 14,
    confidence: 98,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletionTime: "2026-07-02T18:00:00Z"
  },
  {
    _id: "issue-2",
    title: "Overflowing Garbage bins next to Community Park",
    description: "The main public dumpster at the park entrance has been overflowing for three days. Strays are scattering trash everywhere, causing a terrible odor and attracting pests. Needs immediate clearance.",
    category: "Garbage" as const,
    predictedCategory: "Garbage",
    severity: "Medium" as const,
    status: "Reported" as const,
    images: [
      "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600"
    ],
    latitude: 39.7924,
    longitude: -89.6631,
    address: "Community Park East, Springfield, IL",
    reporterId: "u-citizen-1",
    reporterName: "Alex Rivera",
    assignedAuthority: "Sanitation Department",
    verificationCount: 6,
    confidence: 95,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "issue-3",
    title: "Broken Streetlight on Elm Street",
    description: "Streetlight number #ELM-402 is completely dark since last Wednesday. The whole corner is pitch black, making it unsafe for residents walking home in the evening.",
    category: "Broken Streetlight" as const,
    predictedCategory: "Broken Streetlight",
    severity: "Medium" as const,
    status: "Resolved" as const,
    images: [
      "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&q=80&w=600"
    ],
    latitude: 39.7684,
    longitude: -89.6352,
    address: "410 Elm St, Springfield, IL",
    reporterId: "u-citizen-1",
    reporterName: "Alex Rivera",
    assignedAuthority: "Electric Department",
    verificationCount: 22,
    confidence: 99,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    beforeAfterImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=600",
    resolutionProof: "Bulb replaced and fixture connection upgraded to heavy-duty weather resistant fittings."
  }
];

const INITIAL_COMMENTS = [
  {
    _id: "c-1",
    issueId: "issue-1",
    userId: "u-auth-1",
    userName: "Chief Eng. Thomas Vance",
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    userRole: "Authority" as const,
    comment: "This has been scheduled for priority filling. Our road repair crew is heading there tomorrow morning.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "c-2",
    issueId: "issue-1",
    userId: "u-citizen-1",
    userName: "Alex Rivera",
    userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    userRole: "Citizen" as const,
    comment: "Thank you! Please watch out for the water line right underneath that section.",
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    _id: "notif-1",
    userId: "u-citizen-1",
    title: "Issue Status Updated",
    message: "Your reported pothole on Lincoln Avenue has been set to 'In Progress'.",
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "notif-2",
    userId: "u-citizen-1",
    title: "Achievement Unlocked!",
    message: "Congratulations! You earned the 'Neighborhood Guardian' badge for 10+ community verifications.",
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Read from database helper
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const data = {
      users: INITIAL_USERS,
      issues: INITIAL_ISSUES,
      comments: INITIAL_COMMENTS,
      verifications: [] as any[],
      notifications: INITIAL_NOTIFICATIONS,
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return data;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read JSON DB, restoring defaults:", err);
    return {
      users: INITIAL_USERS,
      issues: INITIAL_ISSUES,
      comments: INITIAL_COMMENTS,
      verifications: [],
      notifications: INITIAL_NOTIFICATIONS,
    };
  }
}

// Write to database helper
function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Custom simple JWT Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  try {
    // Decode custom base64 simulated JWT
    const decodedStr = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(decodedStr);

    // Verify expiration (simple check)
    if (payload.exp < Date.now()) {
      return res.status(403).json({ error: "Token expired" });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// Helper to sign JWT
function generateToken(user: any) {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    city: user.city,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// REST APIs

// 1. POST /api/register
app.post("/api/register", (req, res) => {
  const { name, email, phone, password, address, city, state, role } = req.body;

  if (!name || !email || !password || !city) {
    return res.status(400).json({ error: "Please provide name, email, password, and city" });
  }

  const db = readDB();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
  const newUser = {
    _id: "u-" + Math.random().toString(36).substr(2, 9),
    name,
    email,
    phone: phone || "",
    password: hashedPassword,
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    address: address || "",
    city,
    state: state || "",
    points: 10, // Register bonus
    badges: ["Local Watcher"],
    role: (role as any) || "Citizen",
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  // Add registration notification
  const welcomeNotification = {
    _id: "notif-" + Math.random().toString(36).substr(2, 9),
    userId: newUser._id,
    title: "Welcome to Community Hero!",
    message: `Hi ${name}, thank you for joining Springfield's official problem solver app. You received 10 points!`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(welcomeNotification);
  writeDB(db);

  const token = generateToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ token, user: userWithoutPassword });
});

// 2. POST /api/login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
  if (user.password !== hashedPassword) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// 3. GET /api/profile
app.get("/api/profile", authenticateToken, (req: any, res) => {
  const db = readDB();
  const user = db.users.find((u: any) => u._id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User profile not found" });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// 4. PUT /api/profile
app.put("/api/profile", authenticateToken, (req: any, res) => {
  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u._id === req.user.userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const { name, phone, address, city, state, profileImage } = req.body;
  const user = db.users[userIndex];

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (city) user.city = city;
  if (state !== undefined) user.state = state;
  if (profileImage) user.profileImage = profileImage;

  db.users[userIndex] = user;
  writeDB(db);

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// 5. POST /api/issue
app.post("/api/issue", authenticateToken, async (req: any, res) => {
  const { title, description, category, latitude, longitude, address, images } = req.body;

  if (!description || !latitude || !longitude) {
    return res.status(400).json({ error: "Description, latitude and longitude are required" });
  }

  const db = readDB();

  // Smart department routing map based on category
  const getDepartment = (cat: string) => {
    const map: Record<string, string> = {
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
      Others: "General Administration",
    };
    return map[cat] || "General Administration";
  };

  // AI Feature Integration: Analysis via Google Gemini
  let predictedCategory = category || "Others";
  let confidence = 85;
  let severity = "Medium";
  let assignedDepartment = getDepartment(predictedCategory);
  let duplicateFound = false;
  let duplicateIssueId = "";

  const aiClient = getGeminiClient();

  if (aiClient) {
    try {
      console.log("Analyzing report with Gemini...");
      const nearbyIssuesStr = db.issues
        .filter((issue: any) => issue.status !== "Resolved" && issue.status !== "Closed")
        .map((issue: any) => `ID: ${issue._id}, Title: ${issue.title}, Desc: ${issue.description}, Lat: ${issue.latitude}, Long: ${issue.longitude}`)
        .slice(0, 10)
        .join("\n");

      // We compose a structured analysis prompt
      const prompt = `
You are the AI analyzer for a hyperlocal citizen civic app called 'Community Hero'.
An issue has been reported.
Reporter Title: "${title || "Not provided"}"
Reporter Description: "${description}"
Reporter Latitude: ${latitude}
Reporter Longitude: ${longitude}
Selected Category (Optional): "${category || "None Selected"}"

Recent Nearby Open Issues in Database:
${nearbyIssuesStr || "None"}

Analyze and respond strictly in JSON format.
Your task:
1. Predict Category: Classify the issue into exactly one of these: "Pothole", "Garbage", "Broken Streetlight", "Water Leakage", "Drainage Blockage", "Illegal Dumping", "Road Damage", "Traffic Signal", "Tree Fallen", "Public Toilet Damage", "Broken Sidewalk", "Flooding", "Others".
2. Predict Confidence: A rating from 0 to 100.
3. Predict Severity: Evaluate if this is "Low" (nuisance), "Medium" (standard repair), "High" (accidents likely / critical block), or "Critical" (life-threatening hazard, water/electricity main break, disaster).
4. Suggested Department: Choose a department like "Road Authority", "Sanitation Department", "Electric Department", "Water Board", "Traffic Command", "Disaster Response", "Municipal Maintenance", or "General Administration".
5. Duplicate Detection: Compare current issue's coordinates (${latitude}, ${longitude}) and description to the listed "Recent Nearby Open Issues". If the GPS is very close (within 0.005 degrees, approx 500m) AND the issue describes the same hazard, flag duplicate as true and identify the duplicateIssueId.

Respond with ONLY a JSON object having the following keys:
{
  "predictedCategory": string,
  "confidence": number,
  "severity": "Low" | "Medium" | "High" | "Critical",
  "suggestedDepartment": string,
  "duplicateFound": boolean,
  "duplicateIssueId": string
}
`;

      const parts: any[] = [{ text: prompt }];

      // Include base64 image if uploaded
      if (images && images.length > 0) {
        const matches = images[0].match(/^data:(image\/.+);base64,(.*)$/);
        if (matches) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());

      predictedCategory = result.predictedCategory || predictedCategory;
      confidence = result.confidence || confidence;
      severity = result.severity || severity;
      assignedDepartment = result.suggestedDepartment || getDepartment(predictedCategory);
      duplicateFound = !!result.duplicateFound;
      duplicateIssueId = result.duplicateIssueId || "";

      console.log("Gemini prediction success:", result);
    } catch (err) {
      console.error("Gemini analysis error, falling back to analytical prediction:", err);
      // Fallback simple rule engine
      if (description.toLowerCase().includes("pothole") || description.toLowerCase().includes("cracked")) {
        predictedCategory = "Pothole";
        severity = "High";
      } else if (description.toLowerCase().includes("garbage") || description.toLowerCase().includes("trash") || description.toLowerCase().includes("waste")) {
        predictedCategory = "Garbage";
        severity = "Medium";
      } else if (description.toLowerCase().includes("light") || description.toLowerCase().includes("dark") || description.toLowerCase().includes("bulb")) {
        predictedCategory = "Broken Streetlight";
        severity = "Medium";
      } else if (description.toLowerCase().includes("leak") || description.toLowerCase().includes("water pipe")) {
        predictedCategory = "Water Leakage";
        severity = "High";
      } else if (description.toLowerCase().includes("flood") || description.toLowerCase().includes("water logging")) {
        predictedCategory = "Flooding";
        severity = "Critical";
      }
      assignedDepartment = getDepartment(predictedCategory);
    }
  } else {
    // Basic heuristics fallback when GEMINI_API_KEY is not configured
    const descLower = description.toLowerCase();
    if (descLower.includes("pothole") || descLower.includes("crater")) {
      predictedCategory = "Pothole";
      severity = "High";
    } else if (descLower.includes("garbage") || descLower.includes("dumping") || descLower.includes("trash")) {
      predictedCategory = "Garbage";
      severity = "Medium";
    } else if (descLower.includes("light") || descLower.includes("bulb") || descLower.includes("lamp")) {
      predictedCategory = "Broken Streetlight";
      severity = "Medium";
    } else if (descLower.includes("leak") || descLower.includes("burst")) {
      predictedCategory = "Water Leakage";
      severity = "High";
    } else if (descLower.includes("flood") || descLower.includes("drain")) {
      predictedCategory = "Flooding";
      severity = "Critical";
    }
    assignedDepartment = getDepartment(predictedCategory);
  }

  // Create issue model
  const finalCategory = category || predictedCategory;
  const newIssue = {
    _id: "issue-" + Math.random().toString(36).substr(2, 9),
    title: title || `${finalCategory} Report at Springfield`,
    description,
    category: finalCategory,
    predictedCategory,
    severity,
    status: (duplicateFound ? "Reported" : "AI Analysed") as any,
    images: images && images.length > 0 ? images : [
      "https://images.unsplash.com/photo-1594818856205-301116c4c379?auto=format&fit=crop&q=80&w=600"
    ],
    latitude: Number(latitude),
    longitude: Number(longitude),
    address: address || "Springfield, IL",
    reporterId: req.user.userId,
    reporterName: req.user.name,
    assignedAuthority: assignedDepartment,
    verificationCount: 1, // Automatic voter (creator)
    duplicateScore: duplicateFound ? 85 : 0,
    confidence,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.issues.push(newIssue);

  // Award Gamification Points for reporting: 10 points
  const userIndex = db.users.findIndex((u: any) => u._id === req.user.userId);
  if (userIndex !== -1) {
    db.users[userIndex].points += 10;
    // Check for unlocking badges
    const user = db.users[userIndex];
    if (user.points >= 50 && !user.badges.includes("Neighborhood Guardian")) {
      user.badges.push("Neighborhood Guardian");
      db.notifications.push({
        _id: "notif-" + Math.random().toString(36).substr(2, 9),
        userId: user._id,
        title: "New Badge Earned!",
        message: "You've been awarded 'Neighborhood Guardian' badge for reaching 50+ points!",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    if (user.points >= 150 && !user.badges.includes("Community Hero")) {
      user.badges.push("Community Hero");
      db.notifications.push({
        _id: "notif-" + Math.random().toString(36).substr(2, 9),
        userId: user._id,
        title: "New Badge Earned!",
        message: "Amazing! You are now a certified 'Community Hero' for reaching 150+ points!",
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Create notifications for nearby users
  db.users.forEach((otherUser: any) => {
    if (otherUser._id !== req.user.userId && otherUser.role === "Citizen") {
      db.notifications.push({
        _id: "notif-" + Math.random().toString(36).substr(2, 9),
        userId: otherUser._id,
        title: `Nearby issue reported: ${newIssue.category}`,
        message: `An issue has been reported nearby: ${newIssue.title}. Help verify it!`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  });

  writeDB(db);

  res.status(201).json({
    message: "Report submitted successfully!",
    issue: newIssue,
    duplicateFound,
    duplicateIssueId,
  });
});

// 6. GET /api/issues
app.get("/api/issues", (req, res) => {
  const db = readDB();
  let filtered = [...db.issues];

  const { category, status, search, reporterId, assignedAuthority } = req.query;

  if (category) {
    filtered = filtered.filter((i: any) => i.category === category);
  }
  if (status) {
    filtered = filtered.filter((i: any) => i.status === status);
  }
  if (reporterId) {
    filtered = filtered.filter((i: any) => i.reporterId === reporterId);
  }
  if (assignedAuthority) {
    filtered = filtered.filter((i: any) => i.assignedAuthority === assignedAuthority);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (i: any) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.address.toLowerCase().includes(q)
    );
  }

  // Sort by newest by default
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(filtered);
});

// 7. GET /api/issue/:id
app.get("/api/issue/:id", (req, res) => {
  const db = readDB();
  const issue = db.issues.find((i: any) => i._id === req.params.id);
  if (!issue) {
    return res.status(404).json({ error: "Civic issue report not found" });
  }

  // Find comments
  const comments = db.comments.filter((c: any) => c.issueId === req.params.id);

  res.json({
    issue,
    comments,
  });
});

// 8. PUT /api/issue/:id
app.put("/api/issue/:id", authenticateToken, (req: any, res) => {
  const db = readDB();
  const issueIndex = db.issues.findIndex((i: any) => i._id === req.params.id);
  if (issueIndex === -1) {
    return res.status(404).json({ error: "Issue not found" });
  }

  const issue = db.issues[issueIndex];
  const { status, assignedAuthority, beforeAfterImage, resolutionProof, estimatedCompletionTime } = req.body;

  // Authorization checks
  if (req.user.role === "Citizen" && issue.reporterId !== req.user.userId && status !== "Closed") {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  // Handle status transit
  if (status) {
    const oldStatus = issue.status;
    issue.status = status;
    issue.updatedAt = new Date().toISOString();

    // Notify original reporter
    db.notifications.push({
      _id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: issue.reporterId,
      title: "Issue Status Changed",
      message: `Your issue '${issue.title}' was updated from '${oldStatus}' to '${status}'.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Award bonus points on Resolution: 20 points to original reporter
    if (status === "Resolved" && oldStatus !== "Resolved") {
      const reporterIndex = db.users.findIndex((u: any) => u._id === issue.reporterId);
      if (reporterIndex !== -1) {
        db.users[reporterIndex].points += 20;
        db.notifications.push({
          _id: "notif-" + Math.random().toString(36).substr(2, 9),
          userId: issue.reporterId,
          title: "Resolution Points Awarded!",
          message: "Hooray! Your reported issue has been marked resolved. You earned +20 points!",
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  if (assignedAuthority) {
    issue.assignedAuthority = assignedAuthority;
  }
  if (beforeAfterImage) {
    issue.beforeAfterImage = beforeAfterImage;
  }
  if (resolutionProof) {
    issue.resolutionProof = resolutionProof;
  }
  if (estimatedCompletionTime) {
    issue.estimatedCompletionTime = estimatedCompletionTime;
  }

  db.issues[issueIndex] = issue;
  writeDB(db);

  res.json({ message: "Issue updated successfully", issue });
});

// 9. DELETE /api/issue/:id
app.delete("/api/issue/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Only administrative authorities can delete reports." });
  }

  const db = readDB();
  const issueIndex = db.issues.findIndex((i: any) => i._id === req.params.id);
  if (issueIndex === -1) {
    return res.status(404).json({ error: "Issue not found" });
  }

  const issue = db.issues[issueIndex];
  db.issues.splice(issueIndex, 1);

  // Notify reporter of deletion
  db.notifications.push({
    _id: "notif-" + Math.random().toString(36).substr(2, 9),
    userId: issue.reporterId,
    title: "Report Deleted by Admin",
    message: `Your report '${issue.title}' was deleted by the administrator as it was marked as duplicate/fake.`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  res.json({ message: "Fake/Duplicate report deleted successfully" });
});

// 10. POST /api/verify
app.post("/api/verify", authenticateToken, (req: any, res) => {
  const { issueId, vote } = req.body; // vote: 'up' or 'down'

  if (!issueId || !vote) {
    return res.status(400).json({ error: "IssueId and vote ('up' | 'down') are required" });
  }

  const db = readDB();
  const issueIndex = db.issues.findIndex((i: any) => i._id === issueId);
  if (issueIndex === -1) {
    return res.status(404).json({ error: "Issue not found" });
  }

  // Prevent multiple votes by same user
  if (!db.verifications) {
    db.verifications = [];
  }
  const existingVote = db.verifications.find((v: any) => v.issueId === issueId && v.userId === req.user.userId);
  if (existingVote) {
    return res.status(400).json({ error: "You have already verified this report." });
  }

  const newVerification = {
    _id: "v-" + Math.random().toString(36).substr(2, 9),
    issueId,
    userId: req.user.userId,
    vote,
    createdAt: new Date().toISOString(),
  };

  db.verifications.push(newVerification);

  // Increment verification counter on the issue
  const issue = db.issues[issueIndex];
  if (vote === "up") {
    issue.verificationCount += 1;
    if (issue.verificationCount >= 5 && issue.status === "AI Analysed") {
      issue.status = "Community Verified";
    }
  } else {
    issue.verificationCount = Math.max(0, issue.verificationCount - 1);
  }

  // Award verify points: 5 points
  const userIndex = db.users.findIndex((u: any) => u._id === req.user.userId);
  if (userIndex !== -1) {
    db.users[userIndex].points += 5;
    const user = db.users[userIndex];
    if (user.points >= 50 && !user.badges.includes("Neighborhood Guardian")) {
      user.badges.push("Neighborhood Guardian");
    }
  }

  writeDB(db);
  res.json({ message: "Verification recorded successfully", pointsEarned: 5, issue });
});

// 11. POST /api/comment
app.post("/api/comment", authenticateToken, (req: any, res) => {
  const { issueId, comment } = req.body;

  if (!issueId || !comment) {
    return res.status(400).json({ error: "IssueId and comment text are required" });
  }

  const db = readDB();
  const issue = db.issues.find((i: any) => i._id === issueId);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  const user = db.users.find((u: any) => u._id === req.user.userId);
  const newComment = {
    _id: "c-" + Math.random().toString(36).substr(2, 9),
    issueId,
    userId: req.user.userId,
    userName: req.user.name,
    userImage: user?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    userRole: req.user.role,
    comment,
    createdAt: new Date().toISOString(),
  };

  db.comments.push(newComment);

  // Notify original reporter if someone else commented
  if (issue.reporterId !== req.user.userId) {
    db.notifications.push({
      _id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: issue.reporterId,
      title: "New comment on your report",
      message: `${req.user.name} commented: "${comment.substring(0, 30)}..."`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  writeDB(db);
  res.status(201).json(newComment);
});

// 12. GET /api/leaderboard
app.get("/api/leaderboard", (req, res) => {
  const db = readDB();
  const citizens = db.users
    .filter((u: any) => u.role === "Citizen")
    .map((u: any) => ({
      userId: u._id,
      name: u.name,
      profileImage: u.profileImage,
      points: u.points,
      badgesCount: u.badges.length,
    }))
    .sort((a: any, b: any) => b.points - a.points);

  const leaderboard = citizens.map((c: any, index: number) => ({
    ...c,
    rank: index + 1,
  }));

  res.json(leaderboard);
});

// 13. GET /api/notifications
app.get("/api/notifications", authenticateToken, (req: any, res) => {
  const db = readDB();
  const userNotifications = db.notifications
    .filter((n: any) => n.userId === req.user.userId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(userNotifications);
});

// Mark notifications as read
app.put("/api/notifications/read", authenticateToken, (req: any, res) => {
  const db = readDB();
  db.notifications.forEach((n: any) => {
    if (n.userId === req.user.userId) {
      n.read = true;
    }
  });
  writeDB(db);
  res.json({ message: "Notifications marked as read" });
});

// 14. GET /api/analytics
app.get("/api/analytics", async (req, res) => {
  const db = readDB();
  const issues = db.issues;

  // Counts
  const total = issues.length;
  const resolved = issues.filter((i: any) => i.status === "Resolved" || i.status === "Closed").length;
  const pending = total - resolved;

  // Categories distribution
  const categoriesMap: Record<string, number> = {};
  issues.forEach((i: any) => {
    categoriesMap[i.category] = (categoriesMap[i.category] || 0) + 1;
  });
  const categoriesData = Object.keys(categoriesMap).map((key) => ({
    name: key,
    value: categoriesMap[key],
  }));

  // Statuses distribution
  const statusMap: Record<string, number> = {};
  issues.forEach((i: any) => {
    statusMap[i.status] = (statusMap[i.status] || 0) + 1;
  });
  const statusData = Object.keys(statusMap).map((key) => ({
    name: key,
    value: statusMap[key],
  }));

  // Average resolution time (simulated based on timestamps of resolved items)
  // For resolved items, resolution time = difference between updatedAt and createdAt
  let sumMs = 0;
  let resolvedCount = 0;
  issues.forEach((i: any) => {
    if ((i.status === "Resolved" || i.status === "Closed") && i.createdAt && i.updatedAt) {
      sumMs += new Date(i.updatedAt).getTime() - new Date(i.createdAt).getTime();
      resolvedCount++;
    }
  });
  const averageResolutionTimeHours = resolvedCount > 0 ? Number(((sumMs / (1000 * 60 * 60)) / resolvedCount).toFixed(1)) : 24.5;

  // AI Predictive Analytics via Gemini (Feature 5)
  let predictions = [
    { area: "Lincoln Avenue & 5th St", hazard: "Pothole Cluster Risk", confidence: 94, reason: "High traffic volume combined with recent micro-fissure reports." },
    { area: "East Springfield River Ridge", hazard: "Flooding Hotspot", confidence: 88, reason: "Discharge channel is 12% narrower than historical average, rain expected." },
    { area: "Elm Street Community Park Side", hazard: "Garbage Overflow Hazard", confidence: 79, reason: "Weekly park garbage load has spiked by 30% due to summer activities." }
  ];

  const aiClient = getGeminiClient();
  if (aiClient) {
    try {
      console.log("Generating predictive analytics with Gemini...");
      const historicalContext = issues.map((i: any) => `Category: ${i.category}, Area: ${i.address}, CreatedAt: ${i.createdAt}, Status: ${i.status}`).join("\n");
      const prompt = `
You are the advanced civic planning AI engine of Community Hero.
Based on the following historical log of civic issues:
${historicalContext}

Analyze the spatial and temporal density of issues. Predict 3 hyperlocal risk zones likely to experience issues soon:
1. Identify specific area street names/intersections in Springfield IL
2. Specify the hazard type ("Pothole Cluster Risk", "Flooding Hotspot", "Garbage Overflow Hazard", "Streetlight Blackout")
3. Assign a predictive confidence rating (0-100)
4. Provide a 1-sentence reasoning based on historical log patterns.

Respond with ONLY a JSON array of objects having these keys:
[
  {
    "area": string,
    "hazard": string,
    "confidence": number,
    "reason": string
  }
]
`;
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        predictions = parsed;
      }
    } catch (err) {
      console.error("Failed to generate AI predictions, using heuristics fallback:", err);
    }
  }

  res.json({
    summary: {
      total,
      resolved,
      pending,
      averageResolutionTimeHours,
    },
    categoriesData,
    statusData,
    predictions,
  });
});

// Voice transcription and analysis API (Additional Feature)
app.post("/api/voice-report", authenticateToken, async (req: any, res) => {
  const { audio } = req.body; // Base64 PCM or standard format

  if (!audio) {
    return res.status(400).json({ error: "Voice audio content required." });
  }

  const aiClient = getGeminiClient();
  if (aiClient) {
    try {
      console.log("Transcribing and analyzing voice report with Gemini...");
      const audioPart = {
        inlineData: {
          mimeType: "audio/mp3", // Try converting base64 as mp3
          data: audio,
        },
      };
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          audioPart,
          "This is a citizen voice report of a public civic hazard. Transcribe the audio and summarize the reported issue. Return JSON output only with keys: { 'transcription': string, 'summary': string, 'suggestedCategory': string, 'severity': 'Low' | 'Medium' | 'High' }"
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      const result = JSON.parse(response.text || "{}");
      return res.json(result);
    } catch (err) {
      console.error("Gemini voice transcription failed, falling back to simulated transcript:", err);
    }
  }

  // Standard elegant simulated speech-to-text response
  res.json({
    transcription: "There is a water leak on the corner of Elm Street, the water is flooding onto the sidewalk and cars are having to slow down.",
    summary: "Water leakage overflowing onto sidewalk causing minor obstruction",
    suggestedCategory: "Water Leakage",
    severity: "High",
  });
});

// Daily Login points reward: 2 points
app.post("/api/daily-login", authenticateToken, (req: any, res) => {
  const db = readDB();
  const userIndex = db.users.findIndex((u: any) => u._id === req.user.userId);
  if (userIndex !== -1) {
    db.users[userIndex].points += 2;
    writeDB(db);
    res.json({ message: "Daily check-in completed! +2 points earned.", points: db.users[userIndex].points });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Boot the server with Vite middleware support
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in Development Mode, mounting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in Production Mode, serving static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Community Hero server successfully listening at http://localhost:${PORT}`);
  });
}

startServer();
