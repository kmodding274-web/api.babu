const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();

app.use(express.json());

// Server 1 ke andar token save karne ki file path
const TOKEN_FILE = path.join(__dirname, 'saved_token.json');

// Server start hote hi check karo agar pehle se koi token saved hai
let savedAppToken = "";
if (fs.existsSync(TOKEN_FILE)) {
    try {
        const data = fs.readFileSync(TOKEN_FILE, 'utf8');
        const jsonData = JSON.parse(data);
        savedAppToken = jsonData.token || "";
        console.log("[Server 1] Purana saved token file se successfully load ho gaya hai.");
    } catch (e) {
        console.log("[Server 1] Token file read karne mein error aaya, naya create hoga.");
    }
}

// Token ko automatically save/update karne ka function
function autoUpdateToken(newToken) {
    try {
        savedAppToken = newToken;
        fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token: newToken }, null, 2));
        console.log("[Server 1] Naya token detect hua aur automatically file mein save/update ho gaya!");
    } catch (e) {
        console.error("[Server 1] Token update karte waqt error aaya:", e.message);
    }
}

// Original Server ka URL
const ORIGINAL_SERVER_URL = "https://api.storytv.asia";

// Main Proxy Logic (App ka Fake Server)
app.all('*', async (req, res) => {
    try {
        console.log(`[Server 1] Request aayi: ${req.method} ${req.url}`);

        // 1. App ki request se naya token dhoondna (Headers ya Body se)
        const incomingToken = req.headers['authorization'] || req.headers['token'] || req.body.token;

        if (incomingToken) {
            // Agar request mein naya token aaya hai aur woh purane wale se alag hai, toh auto-update kar lo
            if (incomingToken !== savedAppToken) {
                console.log("[Server 1] App se naya token mila hai, isko update kar rahe hain.");
                autoUpdateToken(incomingToken);
            }
        } else {
            console.log("[Server 1] Naya token nahi mila, pehle se saved token use karenge.");
        }

        // 2. Security Check: Agar Server 1 ke paas ek bhi token saved nahi hai
        if (!savedAppToken) {
            console.log("[Server 1] Error: Koi bhi token saved nahi hai!");
            return res.status(403).json({
                error: "Access Denied",
                message: "Pehle valid token bhejiye!"
            });
        }

        // 3. Original Server ko request forward karna (Server 1 ke paas jo saved token hai, wahi lagakar)
        const targetUrl = `${ORIGINAL_SERVER_URL}${req.url}`;
        const headers = { ...req.headers };
        
        headers['host'] = 'api.storytv.asia'; 
        headers['authorization'] = savedAppToken.startsWith('Bearer ') ? savedAppToken : `Bearer ${savedAppToken}`;

        console.log("[Server 1] Saved token ke sath Original Server ko request bhej rahe hain.");

        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: headers,
            data: req.body,
            validateStatus: () => true 
        });

        console.log(`[Server 1] Original server se response mila status: ${response.status}`);

        // 4. Original Server ka reply seedha App ko wapas bhej dena
        res.status(response.status).json(response.data);

    } catch (error) {
        console.error("[Server 1] Error aagya:", error.message);
        res.status(500).json({
            error: "Server 1 Proxy Error",
            details: error.message
        });
    }
});

// Server 1 start karna
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server 1 (Fake Server) port ${PORT} par bilkul theek chal raha hai!`);
});
