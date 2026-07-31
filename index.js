const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const UPSTREAM_BASE_URL = (
    process.env.UPSTREAM_BASE_URL || "https://story.appsdone.online"
).replace(/\/+$/, "");

const FORWARD_HEADERS = [
    "accept",
    "accept-language",
    "authorization",
    "cookie",
    "content-type",
    "user-agent",
    "x-api-key",
    "x-access-token",
    "x-auth-token",
    "x-client-id",
    "x-device-id",
    "x-request-id",
    "origin",
    "referer",
    "range"
];

function getHeaders(req) {
    const headers = {};

    for (const name of FORWARD_HEADERS) {
        const value = req.get(name);
        if (value) headers[name] = value;
    }

    return headers;
}

app.get("/", (req, res) => {
    res.json({
        code: 200,
        message: "API proxy is running"
    });
});

app.use(async (req, res) => {
    try {
        const target = new URL(
            req.originalUrl,
            `${UPSTREAM_BASE_URL}/`
        );

        const options = {
            method: req.method,
            headers: getHeaders(req),
            redirect: "follow"
        };

        if (!["GET", "HEAD"].includes(req.method)) {
            if (
                req.get("content-type")?.includes("application/json")
            ) {
                options.body = JSON.stringify(req.body ?? {});
            }
        }

        console.log(
            `Proxy: ${req.method} ${target.pathname}${target.search}`
        );

        const upstream = await fetch(target, options);

        res.status(upstream.status);

        upstream.headers.forEach((value, key) => {
            if (
                ![
                    "content-length",
                    "transfer-encoding",
                    "connection"
                ].includes(key.toLowerCase())
            ) {
                res.setHeader(key, value);
            }
        });

        if (req.method === "HEAD" || upstream.status === 204) {
            return res.end();
        }

        const body = Buffer.from(
            await upstream.arrayBuffer()
        );

        return res.end(body);

    } catch (error) {
        console.error("Proxy error:", error);

        return res.status(502).json({
            code: 502,
            message: "Upstream API unreachable",
            error: error.message
        });
    }
});

app.use("/cdn", async (req, res) => {
    try {
        const cdnPath = req.originalUrl.replace(/^\/cdn/, "");
        const cdnUrl = `https://cdn.storymax.app${cdnPath}`;

        const headers = {};

        for (const name of [
            "accept",
            "accept-language",
            "user-agent",
            "range",
            "if-none-match",
            "if-modified-since",
            "cache-control"
        ]) {
            const value = req.get(name);
            if (value) headers[name] = value;
        }

        const response = await fetch(cdnUrl, {
            method: req.method === "HEAD" ? "HEAD" : "GET",
            headers,
            redirect: "follow"
        });

        res.status(response.status);

        const blocked = new Set([
            "connection",
            "keep-alive",
            "transfer-encoding",
            "content-encoding",
            "content-length"
        ]);

        response.headers.forEach((value, key) => {
            if (!blocked.has(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });

        if (req.method === "HEAD" || response.status === 204) {
            return res.end();
        }

        const body = Buffer.from(await response.arrayBuffer());
        return res.end(body);

    } catch (error) {
        console.error("CDN proxy error:", error);

        return res.status(502).json({
            code: 502,
            message: "CDN request failed",
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Upstream: ${UPSTREAM_BASE_URL}`);
});