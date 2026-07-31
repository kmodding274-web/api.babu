const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const UPSTREAM_BASE_URL = (
    process.env.UPSTREAM_BASE_URL || 'https://api.storytv.asia'
).replace(/\/+$/, '');

function copyResponseHeaders(upstream, res) {
    const blocked = new Set([
        'connection',
        'keep-alive',
        'proxy-authenticate',
        'proxy-authorization',
        'te',
        'trailer',
        'transfer-encoding',
        'upgrade',
        'content-encoding',
        'content-length'
    ]);

    upstream.headers.forEach((value, key) => {
        if (!blocked.has(key.toLowerCase())) {
            res.setHeader(key, value);
        }
    });
}

app.all('*', async (req, res) => {
    try {
        const target = new URL(req.originalUrl, `${UPSTREAM_BASE_URL}/`);

        const headers = {
            'accept': req.get('accept') || 'application/json, text/plain, */*',
            'user-agent': req.get('user-agent') || 'api-babu-proxy'
        };

        // Forward legitimate authentication/session information
        // supplied by the client.
        const authHeaders = [
            'authorization',
            'cookie',
            'x-api-key',
            'x-access-token',
            'x-auth-token',
            'x-client-id',
            'x-device-id',
            'x-request-id',
            'origin',
            'referer',
            'accept-language',
            'range'
        ];

        for (const name of authHeaders) {
            const value = req.get(name);
            if (value) {
                headers[name] = value;
            }
        }

        const contentType = req.get('content-type');

        if (contentType) {
            headers['content-type'] = contentType;
        }

        const bodyMethods = new Set([
            'POST',
            'PUT',
            'PATCH',
            'DELETE'
        ]);

        const options = {
            method: req.method,
            headers,
            redirect: 'follow'
        };

        if (bodyMethods.has(req.method)) {
            if (
                contentType &&
                contentType.includes('application/json')
            ) {
                options.body = JSON.stringify(req.body ?? {});
            } else if (
                typeof req.body === 'string' ||
                Buffer.isBuffer(req.body)
            ) {
                options.body = req.body;
            } else if (
                req.body &&
                typeof req.body === 'object'
            ) {
                options.body = JSON.stringify(req.body);
                options.headers['content-type'] =
                    'application/json';
            }
        }

        const upstream = await fetch(target, options);

        res.status(upstream.status);
        copyResponseHeaders(upstream, res);

        if (
            req.method === 'HEAD' ||
            upstream.status === 204
        ) {
            return res.end();
        }

        const buffer = Buffer.from(
            await upstream.arrayBuffer()
        );

        return res.end(buffer);

    } catch (err) {
        console.error('Upstream proxy error:', err);

        return res.status(502).json({
            code: 502,
            message: 'Unable to reach upstream API',
            error: err.message
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `API proxy running on port ${PORT}`
    );

    console.log(
        `Upstream: ${UPSTREAM_BASE_URL}`
    );
});