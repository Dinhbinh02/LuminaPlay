const API_BASE = "https://ophim1.com";
const video = document.getElementById("video");
const episodesGrid = document.getElementById("episodes");
const loader = document.getElementById("loader");

let hls = null;
let currentMovie = null;
let currentEpName = "";
let currentEpIndex = 0;

// Cấu hình lọc (Đồng bộ với index.js)
const filters = [
    { id: 'selectCategory', type: 'the-loai', label: 'Thể loại' },
    { id: 'selectCountry', type: 'quoc-gia', label: 'Quốc gia' },
    { id: 'selectYear', type: 'nam-phat-hanh', label: 'Năm' }
];

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const epIndex = params.get('ep') || 0;
    const startTime = params.get('t') || 0;

    // --- Logic Header đồng bộ ---
    const filterBar = document.getElementById('filterBar');
    const filterBtn = document.getElementById('filterToggle');

    if (filterBtn && filterBar) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isClosing = filterBar.classList.contains('expanded');
            filterBar.classList.toggle('expanded');
            if (isClosing) {
                document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
            }
        });
    }

    // Xử lý tìm kiếm
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== "") {
                window.location.assign(`index.html?q=${encodeURIComponent(searchInput.value.trim())}`);
            }
        });
    }

    initFilters();

    // Đóng dropdown khi click ra ngoài
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
        }
    });

    if (slug) {
        playMovie(slug, parseInt(epIndex), parseFloat(startTime));
    } else {
        window.location.href = "index.html";
    }
});

async function initFilters() {
    try {
        const [cats, counts, years] = await Promise.all([
            fetch(`${API_BASE}/v1/api/the-loai`).then(r => r.json()),
            fetch(`${API_BASE}/v1/api/quoc-gia`).then(r => r.json()),
            fetch(`${API_BASE}/v1/api/nam-phat-hanh`).then(r => r.json())
        ]);

        const getItems = (obj) => {
            if (!obj || !obj.data) return [];
            return Array.isArray(obj.data) ? obj.data : (obj.data.items || []);
        };

        // --- ĐỒNG BỘ: Chèn Phim Bộ / Phim Lẻ ---
        const rawCats = getItems(cats);
        const specialTypes = [
            { name: "Phim Bộ", slug: "phim-le", customType: "danh-sach" },
            { name: "Phim Lẻ", slug: "phim-bo", customType: "danh-sach" }
        ];
        const combinedCats = [...specialTypes, ...rawCats];

        buildCustomDropdown('selectCategory', combinedCats, 'the-loai', 'Thể loại');
        buildCustomDropdown('selectCountry', getItems(counts), 'quoc-gia', 'Quốc gia');

        const yearsList = getItems(years);
        const mappedYears = yearsList.map(y => {
            let val = "";
            if (typeof y === 'object' && y !== null) {
                val = y.name || y.slug;
            } else { val = y; }
            return { name: val || "2024", slug: val || "2024" };
        });

        buildCustomDropdown('selectYear', mappedYears, 'nam-phat-hanh', 'Năm');

    } catch (e) {
        console.error("Filter Init Error:", e);
    }
}

function buildCustomDropdown(containerId, items, type, defaultLabel) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const trigger = container.querySelector('.select-trigger');
    const optionsBox = container.querySelector('.options-container');
    const triggerText = trigger.querySelector('span');

    container.selectedItems = [];

    trigger.onclick = (e) => {
        e.stopPropagation();
        const isActive = container.classList.contains('active');
        
        // Đóng các dropdown khác trước
        document.querySelectorAll('.custom-select').forEach(s => {
            if (s !== container && s.classList.contains('active')) s.classList.remove('active');
        });

        container.classList.toggle('active');

        // Nếu vừa ĐÓNG dropdown xong, tiến hành Redirect về trang chủ
        if (isActive && container.selectedItems.length > 0) {
             const slugs = container.selectedItems.map(i => i.slug).join(',');
             const names = container.selectedItems.map(i => i.name).join(', ');
             const queryType = container.selectedItems[0].customType || type;
             window.location.assign(`index.html?type=filter&subtype=${queryType}&slug=${slugs}&name=${encodeURIComponent(names)}`);
        }
    };

    const defaultOpt = document.createElement('div');
    defaultOpt.className = 'option';
    defaultOpt.innerText = "Tất cả";
    defaultOpt.onclick = () => window.location.assign('index.html');
    optionsBox.appendChild(defaultOpt);

    items.forEach(item => {
        const opt = document.createElement('div');
        opt.className = 'option';
        opt.innerText = item.name;
        opt.onclick = (e) => {
            e.stopPropagation();
            const idx = container.selectedItems.findIndex(i => i.slug === item.slug);
            if (idx > -1) {
                container.selectedItems.splice(idx, 1);
                opt.classList.remove('selected');
            } else {
                container.selectedItems.push(item);
                opt.classList.add('selected');
            }

            if (container.selectedItems.length > 0) {
                const names = container.selectedItems.map(i => i.name).join(', ');
                triggerText.innerText = container.selectedItems.length > 2 ? `${container.selectedItems.length} mục đã chọn` : names;
                container.classList.add('has-selection');
            } else {
                triggerText.innerText = defaultLabel;
                container.classList.remove('has-selection');
            }
        };
        optionsBox.appendChild(opt);
    });
}

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
            const serverData = server.server_data || [];

            // Luôn xác định link của tập hiện tại để nạp Player
            const currentEpEntry = serverData[epIndex] || serverData[0];
            if (currentEpEntry) {
                targetLink = currentEpEntry.link_m3u8;
                currentEpName = currentEpEntry.name;
                currentEpIndex = epIndex;
            }

            // CHỈ HIỆN DANH SÁCH NÚT BẤM NẾU CÓ TỪ 2 TẬP TRỞ LÊN
            if (serverData.length > 1) {
                const fragment = document.createDocumentFragment();
                serverData.forEach((ep, index) => {
                    const btn = document.createElement("button");
                    btn.className = "episode-btn" + (index === epIndex ? " active" : "");
                    btn.innerText = ep.name;

                    btn.onclick = () => {
                        document.querySelectorAll('.episode-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        currentEpName = ep.name;
                        currentEpIndex = index;
                        initPlayer(ep.link_m3u8, 0);
                    };
                    fragment.appendChild(btn);
                });
                episodesGrid.appendChild(fragment);
            }
        }

        if (targetLink) {
            initPlayer(targetLink, startTime);
        }

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
    history = history.filter(h => h.slug !== entry.slug);
    history.unshift(entry);
    if (history.length > 10) history.pop();
    localStorage.setItem('watchHistory', JSON.stringify(history));
}

function showLoader(show) {
    if (loader) loader.className = show ? "loader active" : "loader";
}

const IMG_BASE = "https://img.ophim1.com/uploads/movies/";
const DEFAULT_POSTER = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'200' height%3D'300' viewBox%3D'0 0 200 300'%3E%3Crect width%3D'200' height%3D'300' fill%3D'%23252830'%2F%3E%3Ctext x%3D'50%25' y%3D'50%25' dominant-baseline%3D'middle' text-anchor%3D'middle' font-family%3D'sans-serif' font-size%3D'14' fill%3D'%23555'%3EImage Error%3C%2Ftext%3E%3C%2Fsvg%3E";

async function fetchRelatedMovies(movie) {
    if (!movie) return;
    try {
        const nameParts = movie.name.split(' ');
        const searchKeyword = nameParts.slice(0, 3).join(' ');
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
        const relatedMovies = [...searchItems, ...catItems];
        const uniqueMovies = [];
        const seenSlugs = new Set();
        seenSlugs.add(movie.slug);
        for (const m of relatedMovies) {
            if (!seenSlugs.has(m.slug)) {
                uniqueMovies.push(m);
                seenSlugs.add(m.slug);
            }
            if (uniqueMovies.length >= 12) break;
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

// --- Anti-DevTools (Security Shield) ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) e.preventDefault();
});
