import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TICKETS_FILE = path.join(DATA_DIR, "tickets.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

const PRIORITIES = new Set(["Critical", "High", "Medium", "Low"]);
const STATUSES = new Set(["Open", "In Progress", "Pending Client", "Resolved", "Closed"]);
const ROLES = new Set(["inorins", "client"]);
const MESSAGE_ROLES = new Set(["employee", "client"]);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const { password, ...safeUser } = user;
  return safeUser;
}

function toRelativeTime(isoDate) {
  const updatedAt = new Date(isoDate).getTime();
  if (Number.isNaN(updatedAt)) {
    return "just now";
  }

  const diffMs = Date.now() - updatedAt;
  if (diffMs < 60_000) {
    return "just now";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function toMessageTimestamp(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function withLastUpdated(ticket) {
  const updatedAt = ticket.updatedAt ?? ticket.createdAt;
  return {
    ...ticket,
    requestType: ticket.requestType ?? 'Issue',
    lastUpdated: toRelativeTime(updatedAt),
  };
}

async function readJson(filePath, fallbackValue) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      if (fallbackValue !== undefined) {
        await writeJson(filePath, fallbackValue);
        return fallbackValue;
      }
    }
    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(value, null, 2), "utf-8");
  await fs.rename(tempPath, filePath);
}

async function loadUsers() {
  return readJson(USERS_FILE, []);
}

async function loadTickets() {
  return readJson(TICKETS_FILE, []);
}

async function loadMessages() {
  return readJson(MESSAGES_FILE, {});
}

function nextTicketId(tickets) {
  const maxTicketNumber = tickets.reduce((max, ticket) => {
    const maybeNumber = Number(String(ticket.id).split("-")[1]);
    if (Number.isNaN(maybeNumber)) {
      return max;
    }
    return Math.max(max, maybeNumber);
  }, 2400);

  return `TKT-${maxTicketNumber + 1}`;
}

async function deriveBankNameFromEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized.includes('@')) return undefined;
  const [, domain] = normalized.split('@');
  const users = await loadUsers();
  const matched = users.find((user) => user.bankDomain?.toLowerCase() === domain);
  return matched?.bankName;
}

async function updateTicketById(ticketId, updater) {
  const tickets = await loadTickets();
  const index = tickets.findIndex((ticket) => ticket.id === ticketId);
  if (index < 0) {
    return null;
  }

  const current = tickets[index];
  const next = updater(current);
  tickets[index] = next;
  await writeJson(TICKETS_FILE, tickets);
  return next;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/auth/demo-users", async (_req, res, next) => {
  try {
    const users = await loadUsers();
    res.json(users.map(sanitizeUser));
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/users/:id", async (req, res, next) => {
  try {
    const users = await loadUsers();
    const user = users.find((item) => item.id === req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const users = await loadUsers();
    const found = users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
    );

    if (!found) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    res.json(sanitizeUser(found));
  } catch (error) {
    next(error);
  }
});

app.get("/api/tickets", async (_req, res, next) => {
  try {
    const tickets = await loadTickets();
    const normalized = tickets
      .map(withLastUpdated)
      .sort((a, b) => {
        const aNum = Number(String(a.id).split("-")[1]) || 0;
        const bNum = Number(String(b.id).split("-")[1]) || 0;
        return bNum - aNum;
      });
    res.json(normalized);
  } catch (error) {
    next(error);
  }
});

app.get("/api/tickets/:id", async (req, res, next) => {
  try {
    const tickets = await loadTickets();
    const ticket = tickets.find((item) => item.id === req.params.id);
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }
    res.json(withLastUpdated(ticket));
  } catch (error) {
    next(error);
  }
});

app.post("/api/tickets", async (req, res, next) => {
  try {
    const now = new Date();
    const payload = req.body ?? {};

    const title = String(payload.title ?? "").trim();
    const requestedBankName = String(payload.bankName ?? "").trim();
    const reporterEmail = String(payload.reporterEmail ?? "").trim();
    const system = String(payload.system ?? "").trim();
    const module = String(payload.module ?? "").trim();
    const form = String(payload.form ?? "").trim();

    if (!title || !system || !module || !form) {
      res.status(400).json({ message: "Title, system, module, and form are required." });
      return;
    }

    const priority = PRIORITIES.has(payload.priority) ? payload.priority : "Medium";
    const environment = payload.environment === "Production" ? "Production" : "UAT";
    const requestType = ['Issue', 'Add Form', 'Add Report'].includes(payload.requestType) ? payload.requestType : 'Issue';
    const requestedDelivery = typeof payload.requestedDelivery === 'string' ? payload.requestedDelivery : '';
    const moduleDetails = typeof payload.moduleDetails === 'string' ? payload.moduleDetails : '';
    const inferredBankName = await deriveBankNameFromEmail(reporterEmail);
    const bankName = requestedBankName || inferredBankName || '';

    const tickets = await loadTickets();
    const ticketId = nextTicketId(tickets);
    const uploadDir = path.join(__dirname, 'uploads', ticketId);

    const attachments = [];
    if (Array.isArray(payload.attachments)) {
      await fs.mkdir(uploadDir, { recursive: true });
      for (const item of payload.attachments) {
        if (
          item &&
          typeof item.name === 'string' &&
          typeof item.size === 'number' &&
          typeof item.type === 'string'
        ) {
          const attachment = {
            name: item.name,
            size: item.size,
            type: item.type,
          };

          if (typeof item.content === 'string') {
            const base64 = item.content.split(',').pop() ?? '';
            const buffer = Buffer.from(base64, 'base64');
            const safeName = path.basename(item.name);
            const savedName = `${Date.now()}-${safeName}`;
            const filePath = path.join(uploadDir, savedName);
            await fs.writeFile(filePath, buffer);
            attachment.url = `/uploads/${ticketId}/${encodeURIComponent(savedName)}`;
          }

          attachments.push(attachment);
        }
      }
    }

    const ticket = {
      id: ticketId,
      title,
      bankName: bankName || undefined,
      system,
      module,
      moduleDetails: moduleDetails || undefined,
      form,
      requestType,
      requestedDelivery: requestedDelivery || undefined,
      priority,
      status: "Open",
      environment,
      reporter: String(payload.reporter ?? "Unknown Reporter"),
      reporterEmail: String(payload.reporterEmail ?? "unknown@inorins.local"),
      assignee: "",
      description: String(payload.description ?? ""),
      attachments,
      createdAt: now.toISOString().slice(0, 10),
      updatedAt: now.toISOString(),
    };

    tickets.push(ticket);
    await writeJson(TICKETS_FILE, tickets);

    const messages = await loadMessages();
    if (!messages[ticket.id]) {
      messages[ticket.id] = [];
      await writeJson(MESSAGES_FILE, messages);
    }

    res.status(201).json(withLastUpdated(ticket));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/tickets/:id/status", async (req, res, next) => {
  try {
    const status = req.body?.status;
    if (!STATUSES.has(status)) {
      res.status(400).json({ message: "Invalid status value." });
      return;
    }

    const updated = await updateTicketById(req.params.id, (ticket) => ({
      ...ticket,
      status,
      updatedAt: new Date().toISOString(),
    }));

    if (!updated) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    res.json(withLastUpdated(updated));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/tickets/:id/assign", async (req, res, next) => {
  try {
    const assignee = String(req.body?.assignee ?? "").trim();

    const updated = await updateTicketById(req.params.id, (ticket) => ({
      ...ticket,
      assignee,
      updatedAt: new Date().toISOString(),
    }));

    if (!updated) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    res.json(withLastUpdated(updated));
  } catch (error) {
    next(error);
  }
});

app.get("/api/tickets/:id/messages", async (req, res, next) => {
  try {
    const tickets = await loadTickets();
    const exists = tickets.some((ticket) => ticket.id === req.params.id);
    if (!exists) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    const messages = await loadMessages();
    res.json(messages[req.params.id] ?? []);
  } catch (error) {
    next(error);
  }
});

app.post("/api/tickets/:id/messages", async (req, res, next) => {
  try {
    const tickets = await loadTickets();
    const ticketExists = tickets.some((ticket) => ticket.id === req.params.id);
    if (!ticketExists) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    const content = String(req.body?.content ?? "").trim();
    if (!content) {
      res.status(400).json({ message: "Message content is required." });
      return;
    }

    const role = MESSAGE_ROLES.has(req.body?.role) ? req.body.role : "employee";
    const author = String(
      req.body?.author ?? (role === "client" ? "Client" : "Inorins Support"),
    ).trim();

    const message = {
      id: `${req.params.id}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`,
      author: author || (role === "client" ? "Client" : "Inorins Support"),
      role,
      content,
      timestamp: toMessageTimestamp(new Date()),
      isInternal: Boolean(req.body?.isInternal),
    };

    const messages = await loadMessages();
    const existing = messages[req.params.id] ?? [];
    messages[req.params.id] = [...existing, message];
    await writeJson(MESSAGES_FILE, messages);

    await updateTicketById(req.params.id, (ticket) => ({
      ...ticket,
      updatedAt: new Date().toISOString(),
    }));

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

app.get("/api/stats", async (_req, res, next) => {
  try {
    const tickets = await loadTickets();
    const openTickets = tickets.filter((ticket) => ticket.status === "Open").length;
    const resolvedThisWeek = tickets.filter((ticket) => ticket.status === "Resolved").length;
    const pendingOurAction = tickets.filter((ticket) => ticket.status === "In Progress").length;

    res.json({
      openTickets,
      resolvedThisWeek,
      pendingOurAction,
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

const port = Number(process.env.API_PORT || 3500);
app.listen(port, () => {
  console.log(`JSON API listening on http://localhost:${port}`);
});
