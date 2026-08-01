const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const ORIGINAL_API_BASE = 'https://story.appsdone.online';

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Proxy Handler (Using Built-in fetch)
app.use(async (req, res) => {
    try {
        const targetUrl = `${ORIGINAL_API_BASE}${req.originalUrl}`;

        const headers = {
            'appVersion': req.headers['appversion'] || '14',
            'platform': req.headers['platform'] || '0',
            'deviceId': req.headers['deviceid'] || '5de5d3c427dcb215',
            'os': req.headers['os'] || 'Android 16 (API 36)',
            'network_type': req.headers['network_type'] || 'WIFI',
            'X-AYUSH-KEY': req.headers['x-ayush-key'] || 'LEGEND_2026_SECRET',
            'Authorization': req.headers['authorization'] || 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IlN1biBKdW4gMjggMTU6Mjk6MzQgVVRDIDIwMjYiLCJzZXNzaW9uSWQiOiIxNDMzMDU4NSIsImRldmljZUlkIjoiNWRlNWQzYzQyN2RjYjIxNSIsInN1YiI6IjEyMjcxODY5IiwiZXhwIjoxNzgyOTE5Nzc0fQ.z8f023DCzpzGg3J1t4VHloQWBtcPxi9PbxkqP_zl4PQ',
            'User-Agent': 'ktor-client',
            'Content-Type': 'application/json',
            'ts': Math.floor(Date.now() / 1000).toString()
        };

        const fetchOptions = {
            method: req.method,
            headers: headers
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && Object.keys(req.body).length > 0) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        res.status(500).json({
            status: "PROXY_ERROR",
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy Server running live on port ${PORT}`);
});
