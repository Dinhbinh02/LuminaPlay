module.exports = async (req, res) => {
    // Vercel handles CORS headers automatically if configured, or we do it here
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let { url, q } = req.query;

    // Giải mã Base64 tàng hình
    if (q) {
        try {
            // Dùng Buffer của Node.js để giải mã
            url = Buffer.from(q, 'base64').toString('utf-8');
        } catch (e) {
            return res.status(400).json({ error: 'Lỗi giải mã Base64' });
        }
    }

    if (!url) {
        return res.status(400).json({ error: 'Thiếu tham số url hoặc q' });
    }

    try {
        // Sử dụng native fetch có sẵn trong Node.js 18+ (Vercel mặc định hỗ trợ)
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Referer': new URL(url).origin
            }
        });

        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'application/octet-stream');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        // Đọc dữ liệu dưới dạng buffer (arrayBuffer) để hỗ trợ cả JSON và Ảnh
        const data = await response.arrayBuffer();
        return res.send(Buffer.from(data));

    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ 
            error: 'Proxy không thể kết nối tới server nguồn', 
            details: error.message 
        });
    }
};
