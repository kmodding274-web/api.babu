const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();

app.use(express.json());

const TOKEN_FILE = path.join(__dirname, 'saved_token.json');

let savedHeaders = {};
if (fs.existsSync(TOKEN_FILE)) {
    try {
        const data = fs.readFileSync(TOKEN_FILE, 'utf8');
        savedHeaders = JSON.parse(data);
        console.log("[Server 1] Purane saved headers successfully load ho gaye hain.");
    } catch (e) {
        console.log("[Server 1] File read karne mein error aaya.");
    }
}

function autoUpdateHeaders(incomingHeaders) {
    try {
        const currentTimestamp = Math.floor(Date.now() / 1000).toString();

        savedHeaders = {
            'appVersion': incomingHeaders['appversion'] || '14',
            'platform': incomingHeaders['platform'] || '0',
            'deviceId': incomingHeaders['deviceid'] || '83a25beee1317224',
            'os': incomingHeaders['os'] || 'Android 16 (API 36)',
            'network_type': incomingHeaders['network_type'] || 'WIFI',
            'X-AYUSH-KEY': incomingHeaders['x-ayush-key'] || 'LEGEND_2026_SECRET',
            'authorization': incomingHeaders['authorization'] || '',
            'ep_session_id': incomingHeaders['ep_session_id'] || `15544664_${currentTimestamp}`,
            'User-Agent': incomingHeaders['user-agent'] || 'ktor-client',
            'Content-Type': 'application/json',
            'ts': currentTimestamp
        };

        fs.writeFileSync(TOKEN_FILE, JSON.stringify(savedHeaders, null, 2));
        console.log("[Server 1] Naye headers aur ep_session_id save ho gaye hain!");
    } catch (e) {
        console.error("[Server 1] Headers update karte waqt error:", e.message);
    }
}

app.get('/get-token-file', (req, res) => {
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            res.sendFile(TOKEN_FILE);
        } else {
            res.status(404).json({ error: "File abhi bani nahi hai!" });
        }
    } catch (e) {
        res.status(500).json({ error: "File bhejne mein error aaya" });
    }
});

const ORIGINAL_SERVER_URL = "https://api.storytv.asia";

app.all('*', async (req, res, next) => {
    if (req.path === '/get-token-file') return next();

    try {
        console.log(`[Server 1] Request aayi: ${req.method} ${req.url}`);

        if (req.headers['authorization'] || req.headers['deviceid']) {
            autoUpdateHeaders(req.headers);
        }

        if (!savedHeaders.authorization) {
            return res.status(403).json({ error: "Access Denied", message: "Pehle valid headers bhejiye!" });
        }

        const targetUrl = `${ORIGINAL_SERVER_URL}${req.url}`;
        const currentTimestamp = Math.floor(Date.now() / 1000).toString();
        
        const finalHeaders = {
            ...savedHeaders,
            'host': 'api.storytv.asia',
            'ts': currentTimestamp,
            'ep_session_id': `15544664_${currentTimestamp}`
        };

        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: finalHeaders,
            data: req.body,
            validateStatus: () => true 
        });

        res.status(response.status).json(response.data);

    } catch (error) {
        res.status(500).json({ error: "Server 1 Proxy Error", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server 1 running on port ${PORT}`));
