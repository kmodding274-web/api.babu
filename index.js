const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Automatically convert CDN URLs in JSON responses to this server's CDN proxy.
function rewriteCdnUrls(value, req) {
    const proxyBase = `https://${req.get("host")}/cdn`;

    if (typeof value === "string") {
        return value.replace(
            /https:\/\/cdn\.storymax\.app(?=\/)/g,
            proxyBase
        );
    }

    if (Array.isArray(value)) {
        return value.map(item => rewriteCdnUrls(item, req));
    }

    if (value && typeof value === "object") {
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = rewriteCdnUrls(val, req);
        }
        return result;
    }

    return value;
}

// Send JSON while automatically rewriting every cdn.storymax.app URL.
function sendJsonWithCdnProxy(res, req, data) {
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
    sendJsonWithCdnProxy(res, req, impressionData);
});

// 2. State API
app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    sendJsonWithCdnProxy(res, req, stateData);
});

// 3. Profile API
app.get('/feedservice/v1/shows/5', (req, res) => {
    sendJsonWithCdnProxy(res, req, list5);
});

// 4. Details API
app.get('/userservice/v1/profile/subscription', (req, res) => {
    sendJsonWithCdnProxy(res, req, subscriptionData);
});

// 5. Languages API
app.get('/userservice/v1/languages', (req, res) => {
    sendJsonWithCdnProxy(res, req, languageData);
});

// 6. List APIs (जैसे 10446, 10636, 10638 आदि)
app.get('/userservice/v1/profile', (req, res) => {
    sendJsonWithCdnProxy(res, req, profileData);
});

app.get('/feedservice/v1/shows/223', (req, res) => {
    sendJsonWithCdnProxy(res, req, list223);
});

app.get('/v1/shows/505', (req, res) => {
    sendJsonWithCdnProxy(res, req, list505);
});

app.get('/feedservice/v1/shows/507', (req, res) => {
    sendJsonWithCdnProxy(res, req, list507);
});

app.post('/userservice/v1/device/ids', (req, res) => {
    sendJsonWithCdnProxy(res, req, idsData);
});

app.get('/feedservice/v1/homepage/struct', (req, res) => {
    sendJsonWithCdnProxy(res, req, structData);
});

app.get('/userservice/v1/experiments', (req, res) => {
    sendJsonWithCdnProxy(res, req, experimentsData);
});

app.get('/feedservice/v1/show/cw', (req, res) => {
    sendJsonWithCdnProxy(res, req, cwData);
});

app.get('/feedservice/v1/category/details', (req, res) => {
    sendJsonWithCdnProxy(res, req, detailsData);
});

app.get('/feedservice/v1/shows/512', (req, res) => {
    sendJsonWithCdnProxy(res, req, list512);
});

app.get('/feedservice/v1/shows/509', (req, res) => {
    sendJsonWithCdnProxy(res, req, list509);
});

app.get('/feedservice/v1/shows/755', (req, res) => {
    sendJsonWithCdnProxy(res, req, list755);
});

app.get('/feedservice/v1/shows/514', (req, res) => {
    sendJsonWithCdnProxy(res, req, list514);
});

app.get('/feedservice/v1/shows/515', (req, res) => {
    sendJsonWithCdnProxy(res, req, list515);
});

app.get('/feedservice/v1/shows/516', (req, res) => {
    sendJsonWithCdnProxy(res, req, list516);
});

app.get('/feedservice/v1/shows/519', (req, res) => {
    sendJsonWithCdnProxy(res, req, list519);
});

app.get('/feedservice/v1/shows/521', (req, res) => {
    sendJsonWithCdnProxy(res, req, list521);
});

app.get('/feedservice/v1/shows/522', (req, res) => {
    sendJsonWithCdnProxy(res, req, list522);
});

// Automatic CDN proxy.
// Example:
// /cdn/ta/Malayalam_S3_Links/Apr_2026/.../360_480_Billionaire_Auto_Driver.webp
// will fetch the same path from https://cdn.storymax.app and return it.
app.use("/cdn", async (req, res) => {
    try {
        const cdnUrl = `https://cdn.storymax.app${req.originalUrl.replace(/^\/cdn/, "")}`;

        const response = await fetch(cdnUrl, {
            method: req.method,
            headers: {
                "user-agent": req.get("user-agent") || "Mozilla/5.0",
                "accept": req.get("accept") || "*/*",
                "range": req.get("range") || "",
            }
        });

        res.status(response.status);

        response.headers.forEach((value, key) => {
            // Don't forward hop-by-hop headers.
            if (!["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });

        const body = await response.arrayBuffer();
        res.send(Buffer.from(body));
    } catch (error) {
        console.error("CDN proxy error:", error);
        res.status(502).json({
            code: 502,
            message: "CDN request failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
