import { Express, Request, Response } from "express";
import { checkJwt, checkScopes } from "../middleware/auth";
import expressWs from "express-ws";
import crypto from "crypto";

// --- Presence PoC (in-memory) ---
// NOTE: This is intentionally ephemeral. It will reset on deploy/restart.
// If you run multiple instances, each instance will have its own view.

type PresenceMeta = {
  connectedAt: number;
  lastSeenAt: number;
  email?: string;
  ip?: string;
  userAgent?: string;
  // Optional client-provided fields (keep coarse / non-sensitive):
  orgId?: string;
  view?: "map" | "chart" | string;
  horizonBucket?: string; // e.g. "0-3", "3-12", "12-36"
};

const PRESENCE_TTL_MS = 60_000; // consider a session active if we saw it in the last 60s
const presenceById = new Map<string, PresenceMeta>();

const prunePresence = () => {
  const now = Date.now();
  for (const [id, meta] of presenceById.entries()) {
    if (now - meta.lastSeenAt > PRESENCE_TTL_MS) presenceById.delete(id);
  }
};

const getPresenceSummary = () => {
  prunePresence();
  const now = Date.now();
  const totalActive = presenceById.size;
  const byOrg: Record<string, number> = {};
  const byView: Record<string, number> = {};
  const byHorizonBucket: Record<string, number> = {};

  for (const meta of presenceById.values()) {
    if (meta.orgId) byOrg[meta.orgId] = (byOrg[meta.orgId] ?? 0) + 1;
    if (meta.view) byView[meta.view] = (byView[meta.view] ?? 0) + 1;
    if (meta.horizonBucket)
      byHorizonBucket[meta.horizonBucket] = (byHorizonBucket[meta.horizonBucket] ?? 0) + 1;
  }

  return {
    asOf: now,
    ttlMs: PRESENCE_TTL_MS,
    totalActive,
    byOrg,
    byView,
    emails: Array.from(presenceById.values())
      .map((m) => m.email ?? "unknown")
      .filter(Boolean),
    byHorizonBucket
  };
};

// --- End Presence PoC ---

// --- WebSocket auth helper (reuses existing checkJwt + checkScopes) ---
// We authenticate the WS stream by requiring an initial message:
//   {"type":"auth","token":"<JWT>"}
// The token is verified using the same middleware as HTTP routes.

type NextFn = (err?: any) => void;

const runMiddleware = (req: Request, mw: (req: any, res: any, next: NextFn) => void) => {
  return new Promise<void>((resolve, reject) => {
    let finished = false;
    let statusCode = 401;

    const finishOk = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      resolve();
    };

    const finishErr = (err: any) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      reject(err);
    };

    // If the middleware neither calls next() nor writes a response, don't hang forever
    const timeout = setTimeout(() => {
      finishErr(new Error("auth middleware timed out"));
    }, 2_000);

    // Minimal mock response object for auth middleware.
    // `express-oauth2-jwt-bearer` may terminate the request by writing to res (instead of next(err)).
    const res: Partial<Response> = {
      status: (code: number) => {
        statusCode = code;
        return res as any;
      },
      json: (body: any) => {
        finishErr(Object.assign(new Error(`auth failed (${statusCode})`), { statusCode, body }));
        return res as any;
      },
      send: (body: any) => {
        finishErr(Object.assign(new Error(`auth failed (${statusCode})`), { statusCode, body }));
        return res as any;
      },
      end: (body?: any) => {
        finishErr(Object.assign(new Error(`auth failed (${statusCode})`), { statusCode, body }));
        return res as any;
      }
    };

    try {
      mw(req as any, res as any, (err?: any) => {
        if (err) finishErr(err);
        else finishOk();
      });
    } catch (e) {
      finishErr(e);
    }
  });
};

const authenticateWsAsAdmin = async (req: Request, token: string) => {
  // Clone-like behavior: just set Authorization header for the middleware
  (req.headers as any).authorization = `Bearer ${token}`;
  await runMiddleware(req, checkJwt as any);
  await runMiddleware(req, checkScopes as any);
};
// --- End WebSocket auth helper ---

const initWebsockets = (app: Express) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const expressWebSock = expressWs(app);

  // Minimal presence PoC:
  // - On connect: create a session id and store metadata
  // - On message: accept a small heartbeat/presence payload
  // - On close: remove from store
  expressWebSock.app.ws("/ws", function (ws, req) {
    const id = crypto.randomUUID?.() ?? crypto.randomBytes(16).toString("hex");
    const now = Date.now();

    // Capture some coarse request metadata (avoid anything sensitive)
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      undefined;
    const userAgent = (req.headers["user-agent"] as string | undefined) ?? undefined;

    presenceById.set(id, {
      connectedAt: now,
      lastSeenAt: now,
      ip,
      userAgent
    });

    // Tell the client its session id (so it can include it in heartbeats if desired)
    ws.send(JSON.stringify({ type: "welcome", id, ttlMs: PRESENCE_TTL_MS }));

    ws.on("message", function (msg) {
      try {
        // Expected payload examples:
        // {"type":"heartbeat"}
        // {"type":"presence","orgId":"org_123","view":"map","horizonBucket":"0-3"}
        const payload = typeof msg === "string" ? JSON.parse(msg) : JSON.parse(msg.toString());

        const meta = presenceById.get(id);
        if (!meta) return;

        meta.lastSeenAt = Date.now();

        if (payload?.type === "presence") {
          // Keep this minimal and coarse. Do NOT send PII.
          if (typeof payload.orgId === "string") meta.orgId = payload.orgId;
          if (typeof payload.view === "string") meta.view = payload.view;
          if (typeof payload.horizonBucket === "string") meta.horizonBucket = payload.horizonBucket;
          if (typeof payload.userHash === "string") meta.email = payload.userHash;
        }

        presenceById.set(id, meta);

        // Optional ack
        if (payload?.type === "presence" || payload?.type === "heartbeat") {
          ws.send(JSON.stringify({ type: "ack", id }));
        }
      } catch (e) {
        // Ignore malformed messages (PoC)
      }
    });

    ws.on("close", function () {
      presenceById.delete(id);
    });

    ws.on("error", function () {
      presenceById.delete(id);
    });
  });

  // Stream version of the /admin/presence endpoint above to allow live updating in the dashboard
  // Auth: client must first send {"type":"auth","token":"<JWT>"} with a token that has the admin scope.
  // Note: This stream is WebSocket-only and not represented in OpenAPI docs.
  expressWebSock.app.ws("/admin/users/presence", function (ws, req) {
    let authed = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    const authDeadline = setTimeout(() => {
      if (!authed) {
        try {
          ws.send(JSON.stringify({ type: "error", message: "unauthorized" }));
        } catch {
          // ignore
        }
        try {
          ws.close();
        } catch {
          // ignore
        }
      }
    }, 30_000);

    // Let manual tools know the socket is open and what to do next
    try {
      ws.send(
        JSON.stringify({ type: "welcome", message: "send {type:'auth', token:'<JWT>'} to begin" })
      );
    } catch {
      // ignore
    }

    const startStreaming = () => {
      if (interval) return;
      // Send immediately, then periodically (adjust cadence as needed)
      ws.send(JSON.stringify({ type: "presence", data: getPresenceSummary() }));
      interval = setInterval(() => {
        try {
          ws.send(JSON.stringify({ type: "presence", data: getPresenceSummary() }));
        } catch {
          // if send fails, close and cleanup
          try {
            ws.close();
          } catch {
            // ignore
          }
        }
      }, 2_000);
    };

    ws.on("message", async function (msg) {
      try {
        const payload = typeof msg === "string" ? JSON.parse(msg) : JSON.parse(msg.toString());

        if (!authed) {
          // Accept token from one of:
          // 1) an explicit auth message: {type:"auth", token:"..."}
          // 2) query string: /ws/presence?token=...
          // 3) Authorization header: Bearer ...
          let token: string | undefined;

          if (payload?.type === "auth" && typeof payload?.token === "string") {
            token = payload.token;
          }

          if (!token && typeof req.url === "string") {
            try {
              const u = new URL(req.url, "http://localhost");
              const qp = u.searchParams.get("token");
              if (qp) token = qp;
            } catch {
              // ignore
            }
          }

          if (!token) {
            const authz = (req.headers["authorization"] as string | undefined) ?? "";
            const m = authz.match(/^Bearer\s+(.+)$/i);
            if (m?.[1]) token = m[1];
          }

          if (!token) {
            ws.send(JSON.stringify({ type: "error", message: "send auth first" }));
            return;
          }

          try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await authenticateWsAsAdmin(req, token);
          } catch (e: any) {
            const statusCode = e?.statusCode ?? 401;
            ws.send(JSON.stringify({ type: "error", message: "unauthorized", statusCode }));
            try {
              ws.close();
            } catch {
              // ignore
            }
            return;
          }

          authed = true;
          clearTimeout(authDeadline);
          ws.send(JSON.stringify({ type: "ack", message: "authorized" }));
          startStreaming();
          return;
        }

        // Optional: allow client pings or manual refresh triggers
        if (payload?.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
        if (payload?.type === "refresh") {
          ws.send(JSON.stringify({ type: "presence", data: getPresenceSummary() }));
        }
      } catch {
        // ignore malformed
      }
    });

    ws.on("close", function () {
      clearTimeout(authDeadline);
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    });

    ws.on("error", function () {
      clearTimeout(authDeadline);
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    });
  });
};

export { initWebsockets };
