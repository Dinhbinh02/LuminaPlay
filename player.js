const API_BASE = "https://ophim1.com";
const video = document.getElementById("video");
const episodesGrid = document.getElementById("episodes");
const loader = document.getElementById("loader");

let hls = null;
let currentMovie = null;
let currentEpName = "";
let currentEpIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const epIndex = params.get('ep') || 0;
    const startTime = params.get('t') || 0;

    // Xử lý tìm kiếm
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== "") {
                window.location.assign(`index.html?q=${encodeURIComponent(searchInput.value.trim())}`);
            }
        });
    }

    if (slug) {
        playMovie(slug, parseInt(epIndex), parseFloat(startTime));
    } else {
        window.location.href = "index.html";
    }
});

async function playMovie(slug, epIndex = 0, startTime = 0) {
    showLoader(true);
    try {
        const res = await fetch(`${API_BASE}/v1/api/phim/${slug}`);
        const data = await res.json();
        currentMovie = data.data.item;

        document.title = `Đang xem: ${currentMovie.name} - Lumina Play`;
        document.getElementById("current-title").innerText = currentMovie.name;

        // Giải mã mô tả
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = (currentMovie.content || "").replace(/<[^>]*>?/gm, '');
        document.getElementById("current-desc").innerText = tempDiv.textContent || "";

        episodesGrid.innerHTML = "";
        let targetLink = "";

        if (data.data.item.episodes && data.data.item.episodes.length > 0) {
            const server = data.data.item.episodes[0];
            const fragment = document.createDocumentFragment();

            server.server_data.forEach((ep, index) => {
                const btn = document.createElement("button");
                btn.className = "episode-btn" + (index === epIndex ? " active" : "");
                btn.innerText = ep.name;

                if (index === epIndex) {
                    targetLink = ep.link_m3u8;
                    currentEpName = ep.name;
                    currentEpIndex = epIndex;
                }

                btn.onclick = () => {
                    document.querySelectorAll('.episode-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentEpName = ep.name;
                    currentEpIndex = index;
                    initPlayer(ep.link_m3u8, 0); // Đổi tập thì reset thời gian
                };
                fragment.appendChild(btn);
            });
            episodesGrid.appendChild(fragment);
        }

        if (targetLink) {
            initPlayer(targetLink, startTime);
        }

        // Tải danh sách phim liên quan và cùng thể loại
        fetchRelatedMovies(currentMovie);

    } catch (err) {
        console.error("Play Error:", err);
    } finally {
        showLoader(false);
    }
}

function initPlayer(url, startTime = 0) {
    if (hls) hls.destroy();

    const startPlay = () => {
        if (startTime > 0) video.currentTime = startTime;
        video.play().catch(() => { });
    };

    if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, startPlay);
    } else {
        video.src = url;
        video.addEventListener('loadedmetadata', startPlay, { once: true });
    }
}

// Lưu lịch sử xem mỗi 5 giây hoặc khi dừng
let lastSaved = 0;
video.addEventListener('timeupdate', () => {
    const now = Date.now();
    if (now - lastSaved > 5000) {
        saveHistory();
        lastSaved = now;
    }
});

video.addEventListener('pause', saveHistory);

function saveHistory() {
    if (!currentMovie || video.currentTime < 5) return;

    let history = JSON.parse(localStorage.getItem('watchHistory') || "[]");

    const entry = {
        slug: currentMovie.slug,
        name: currentMovie.name,
        poster: currentMovie.poster_url,
        epName: currentEpName,
        epIndex: currentEpIndex,
        time: video.currentTime,
        duration: video.duration,
        updatedAt: Date.now()
    };

    // Loại bỏ mục cũ của cùng phim này
    history = history.filter(h => h.slug !== entry.slug);
    history.unshift(entry);

    // Giữ tối đa 10 phim
    if (history.length > 10) history.pop();

    localStorage.setItem('watchHistory', JSON.stringify(history));
}

function showLoader(show) {
    if (loader) loader.className = show ? "loader active" : "loader";
}

// --- Logic Phim Liên Quan ---
const IMG_BASE = "https://img.ophim1.com/uploads/movies/";
const DEFAULT_POSTER = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'200' height%3D'300' viewBox%3D'0 0 200 300'%3E%3Crect width%3D'200' height%3D'300' fill%3D'%23252830'%2F%3E%3Ctext x%3D'50%25' y%3D'50%25' dominant-baseline%3D'middle' text-anchor%3D'middle' font-family%3D'sans-serif' font-size%3D'14' fill%3D'%23555'%3EImage Error%3C%2Ftext%3E%3C%2Fsvg%3E";

async function fetchRelatedMovies(movie) {
    if (!movie) return;

    try {
        // 1. Tìm phim cùng tên (từ khóa 3 chữ đầu) để ra các phần khác (P2, P3...)
        const nameParts = movie.name.split(' ');
        const searchKeyword = nameParts.slice(0, 3).join(' ');

        // 2. Lấy danh sách phim cùng thể loại
        const categorySlug = movie.category && movie.category.length > 0 ? movie.category[0].slug : '';

        const [searchRes, catRes] = await Promise.all([
            fetch(`${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(searchKeyword)}`).catch(() => null),
            categorySlug ? fetch(`${API_BASE}/v1/api/the-loai/${categorySlug}`).catch(() => null) : Promise.resolve(null)
        ]);

        let searchItems = [];
        let catItems = [];

        if (searchRes && searchRes.ok) {
            const data = await searchRes.json();
            searchItems = data.data.items || [];
        }
        if (catRes && catRes.ok) {
            const data = await catRes.json();
            catItems = data.data.items || [];
        }

        // Gộp kết quả: Ưu tiên phim tìm kiếm (phần khác), sau đó là cùng thể loại
        const relatedMovies = [...searchItems, ...catItems];

        // Lọc bỏ phim hiện tại và trùng lặp
        const uniqueMovies = [];
        const seenSlugs = new Set();
        seenSlugs.add(movie.slug);

        for (const m of relatedMovies) {
            if (!seenSlugs.has(m.slug)) {
                uniqueMovies.push(m);
                seenSlugs.add(m.slug);
            }
            if (uniqueMovies.length >= 12) break; // Chỉ lấy tối đa 12 phim
        }

        renderRelatedMovies(uniqueMovies);

    } catch (e) {
        console.error("Error fetching related movies:", e);
    }
}

function renderRelatedMovies(items) {
    const section = document.getElementById('relatedSection');
    const grid = document.getElementById('relatedGrid');

    if (!items || items.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    grid.innerHTML = '';

    items.forEach((movie, index) => {
        let poster = DEFAULT_POSTER;
        if (movie.poster_url) {
            poster = movie.poster_url.startsWith('http') ? movie.poster_url : `${IMG_BASE}${movie.poster_url}`;
        } else if (movie.thumb_url) {
            poster = movie.thumb_url.startsWith('http') ? movie.thumb_url : `${IMG_BASE}${movie.thumb_url}`;
        }

        const quality = movie.quality ? movie.quality.toUpperCase().replace('FULL ', '') : 'HD';
        const epStatus = movie.episode_current || 'Full';
        const rating = (movie.tmdb && movie.tmdb.vote_average) ?
            movie.tmdb.vote_average.toFixed(1) :
            (Math.random() * (9.2 - 7.5) + 7.5).toFixed(1);

        const priorityAttr = index < 4 ? 'fetchpriority="high"' : 'loading="lazy"';

        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
            <div class="poster-wrapper">
                <div class="badge-quality">${quality}</div>
                <div class="badge-ep">${epStatus}</div>
                <div class="movie-rating">
                    <i class="fa-solid fa-star"></i>
                    <span>${rating}</span>
                </div>
                <img class="poster" src="${poster}" alt="${movie.name}" ${priorityAttr} decoding="async">
            </div>
            <div class="details">
                <div class="title">${movie.name}</div>
                <div class="meta">${movie.origin_name || ''}</div>
            </div>
        `;

        const img = card.querySelector('.poster');
        img.addEventListener('load', () => img.classList.add('loaded'));
        img.addEventListener('error', () => {
            img.onerror = null;
            img.src = DEFAULT_POSTER;
        });

        card.onclick = () => {
            window.location.assign(`player.html?slug=${movie.slug}`);
        };

        grid.appendChild(card);
    });
}

// --- Anti-DevTools (Chốt chặn bảo mật) ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) e.preventDefault();
});

