const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.json());

// Rewrite only your authorized CDN domain inside JSON responses.
function rewriteCdnUrls(value, req) {
    const base = `${req.protocol}://${req.get("host")}/cdn`;

    if (typeof value === "string") {
        return value.replace(
            /^https:\/\/cdn\.storymax\.app(?=\/)/g,
            base
        );
    }

    if (Array.isArray(value)) {
        return value.map(v => rewriteCdnUrls(v, req));
    }

    if (value && typeof value === "object") {
        const out = {};
        for (const [key, val] of Object.entries(value)) {
            out[key] = rewriteCdnUrls(val, req);
        }
        return out;
    }

    return value;
}

function sendJson(res, req, data) {
    res.json(rewriteCdnUrls(data, req));
}


// आपकी सभी JSON फाइलें
const subscriptionData = require('./subscription.json');
const stateData = require('./state.json');
const profileData = require('./profile.json');
const detailsData = require('./details.json');
const languageData = require('./languages.json');
const list223 = require('./223.json');
const list5 = require('./5.json');
const impressionData = require('./impression.json');
const cwData = require('./cw.json');
const experimentsData = require('./experiments.json');
const structData = require('./struct.json');
const list505 = require('./505.json');
const idsData = require('./ids.json');
const list507 = require('./507.json');
const list512 = require('./512.json');
const list509 = require('./509.json');
const list755 = require('./755.json');
const list514 = require('./514.json');
const list515 = require('./515.json');
const list516 = require('./516.json');
const list519 = require('./519.json');
const list521 = require('./521.json');
const list522 = require('./522.json');

// 1. Subscription API (Mod Data)
app.post('/analytics/v1/impression', (req, res) => {
    sendJson(res, req, impressionData);
});

// 2. State API
app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    sendJson(res, req, stateData);
});

// 3. Profile API
app.get('/feedservice/v1/shows/5', (req, res) => {
    sendJson(res, req, list5);
});

// 4. Details API
app.get('/userservice/v1/profile/subscription', (req, res) => {
    sendJson(res, req, subscriptionData);
});

// 5. Languages API
app.get('/userservice/v1/languages', (req, res) => {
    sendJson(res, req, languageData);
});

// 6. List APIs (जैसे 10446, 10636, 10638 आदि)
app.get('/userservice/v1/profile', (req, res) => {
    sendJson(res, req, profileData);
});

app.get('/feedservice/v1/shows/223', (req, res) => {
    sendJson(res, req, list223);
});

app.get('/v1/shows/505', (req, res) => {
    sendJson(res, req, list505);
});

app.get('/feedservice/v1/shows/507', (req, res) => {
    sendJson(res, req, list507);
});

app.post('/userservice/v1/device/ids', (req, res) => {
    sendJson(res, req, idsData);
});

app.get('/feedservice/v1/homepage/struct', (req, res) => {
    sendJson(res, req, structData);
});

app.get('/userservice/v1/experiments', (req, res) => {
    sendJson(res, req, experimentsData);
});

app.get('/feedservice/v1/show/cw', (req, res) => {
    sendJson(res, req, cwData);
});

app.get('/feedservice/v1/category/details', (req, res) => {
    sendJson(res, req, detailsData);
});

app.get('/feedservice/v1/shows/512', (req, res) => {
    sendJson(res, req, list512);
});

app.get('/feedservice/v1/shows/509', (req, res) => {
    sendJson(res, req, list509);
});

app.get('/feedservice/v1/shows/755', (req, res) => {
    sendJson(res, req, list755);
});

app.get('/feedservice/v1/shows/514', (req, res) => {
    sendJson(res, req, list514);
});

app.get('/feedservice/v1/shows/515', (req, res) => {
    sendJson(res, req, list515);
});

app.get('/feedservice/v1/shows/516', (req, res) => {
    sendJson(res, req, list516);
});

app.get('/feedservice/v1/shows/519', (req, res) => {
    sendJson(res, req, list519);
});

app.get('/feedservice/v1/shows/521', (req, res) => {
    sendJson(res, req, list521);
});

app.get('/feedservice/v1/shows/522', (req, res) => {
    sendJson(res, req, list522);
});


// Authorized CDN -> API server proxy.
// Request:
//   /cdn/ta/.../file.webp
// becomes:
//   https://cdn.storymax.app/ta/.../file.webp
app.use("/cdn", async (req, res) => {
    try {
        const cdnPath = req.originalUrl.replace(/^\/cdn(?=\/|$)/, "");
        const cdnUrl = `https://cdn.storymax.app${cdnPath}`;

        const headers = {};
        const forwardHeaders = [
            "accept",
            "accept-language",
            "range",
            "if-none-match",
            "if-modified-since",
            "cache-control",
            "user-agent"
        ];

        for (const name of forwardHeaders) {
            const value = req.get(name);
            if (value) headers[name] = value;
        }

        const upstream = await fetch(cdnUrl, {
            method: req.method === "HEAD" ? "HEAD" : "GET",
            headers,
            redirect: "follow"
        });

        res.status(upstream.status);

        const blocked = new Set([
            "connection",
            "keep-alive",
            "proxy-authenticate",
            "proxy-authorization",
            "te",
            "trailer",
            "transfer-encoding",
            "upgrade"
        ]);

        upstream.headers.forEach((value, key) => {
            if (!blocked.has(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });

        if (req.method === "HEAD" || upstream.status === 204) {
            return res.end();
        }

        const body = Buffer.from(await upstream.arrayBuffer());
        return res.end(body);
    } catch (err) {
        console.error("CDN proxy error:", err);
        return res.status(502).json({
            code: 502,
            message: "Unable to fetch authorized CDN resource",
            error: err.message
        });
    }
});

// Simple health check for Render.
app.get("/", (req, res) => {
    res.json({ code: 200, message: "API server is running" });
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
