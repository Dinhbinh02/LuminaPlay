const fetch = require('node-fetch');

module.exports = async (req, res) => {
    let { url, q } = req.query;

    // Nếu dùng tham số 'q', giải mã Base64 (Hỗ trợ vượt tường lửa quét từ khóa)
    if (q) {
        try {
            url = Buffer.from(q, 'base64').toString('ascii');
        } catch (e) {
            return res.status(400).json({ error: 'Invalid base64 in q' });
        }
    }

    if (!url) {
        return res.status(400).json({ error: 'URL or q is required' });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://ophim1.com/'
            }
        });

        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return res.json(data);
        } else {
            const buffer = await response.buffer();
            return res.send(buffer);
        }
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch content', details: error.message });
    }
};
