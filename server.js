const http = require("http");
const fs = require("fs");
const path = require("path");
const { workflowCatalog, scenarios } = require("./src/data/workflows");
const { buildSimulation } = require("./src/services/simulation-service");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

function routeApi(req, res) {
  if (req.method === "GET" && req.url === "/api/workflows") {
    sendJson(res, 200, { workflows: workflowCatalog });
    return true;
  }

  if (req.method === "GET" && req.url === "/api/scenarios") {
    sendJson(res, 200, { scenarios });
    return true;
  }

  if (req.method === "POST" && req.url === "/api/simulate") {
    parseBody(req)
      .then((payload) => {
        const result = buildSimulation(payload, workflowCatalog);
        sendJson(res, 200, result);
      })
      .catch((error) => {
        sendJson(res, 400, { error: error.message });
      });

    return true;
  }

  return false;
}

function routeStatic(req, res) {
  const safePath = req.url === "/" ? "/index.html" : req.url;
  const normalized = path.normalize(safePath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, normalized);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    sendFile(res, filePath);
  });
}

const server = http.createServer((req, res) => {
  if (routeApi(req, res)) {
    return;
  }

  routeStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`AI workflow automation demo running on http://localhost:${PORT}`);
});
