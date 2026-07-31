const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// आपकी सभी JSON फाइलें
const subscriptionData = require('./subscription.json');
const stateData = require('./state.json');
const profileData = require('./profile.json');
const detailsData = require('./details.json');
const languageData = require('./languages.json');
const impressionData = require('./impression.json');
const cwData = require('./cw.json');
const experimentsData = require('./experiments.json');
const structData = require('./struct.json');
const idsData = require('./ids.json');
// 1. Subscription API (Mod Data)
app.post('/analytics/v1/impression', (req, res) => {
    sendJson(res, req, impressionData);
});

// 2. State API
app.get('/userservice/v1/profile/subscription/state', (req, res) => {
    sendJson(res, req, stateData);
});

// 3. Profile API
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

// Accept every endpoint under /feedservice/v1/
app.all('/feedservice/v1/*splat', (req, res) => {
    console.log(`Accepted: ${req.method} ${req.originalUrl}`);

    return res.status(200).json({
        code: 200,
        message: "API endpoint accepted",
        data: {}
    });
});
// Automatic Show API.
// Any numeric show ID is mapped to ./<id>.json automatically.
// Examples:
//   /feedservice/v1/shows/505 -> ./505.json
//   /feedservice/v1/shows/1234?page=0&size=10 -> ./1234.json
app.get('/feedservice/v1/shows/:id', (req, res) => {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            code: 400,
            message: "Invalid show ID"
        });
    }

    const path = require('path');
    const filePath = path.join(__dirname, `${id}.json`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            code: 404,
            message: `JSON file ${id}.json not found`
        });
    }

    try {
        delete require.cache[require.resolve(filePath)];
        const data = require(filePath);
        return sendJson(res, req, data);
    } catch (err) {
        console.error(`Failed to load ${id}.json:`, err);
        return res.status(500).json({
            code: 500,
            message: `Unable to load ${id}.json`,
            error: err.message
        });
    }
});


// Authorized CDN -> API server proxy.
// Request:
//   /cdn/ta/.../file.webp
// becomes:
//   https://cdn.storymax.app/ta/.../file.webp

app.all('/{*splat}', (req, res) => {
    console.log(`Unhandled endpoint accepted: ${req.method} ${req.originalUrl}`);

    return res.status(200).json({
        code: 200,
        message: "API endpoint accepted",
        data: {}
    });
});


// Simple health check for Render.
app.get("/", (req, res) => {
    res.json({ code: 200, message: "API server is running" });
});

app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
