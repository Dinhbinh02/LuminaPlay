// --- Cấu hình API và Chống Chặn (Resilience) ---
const API_DOMAINS = [
    "https://ophim1.com",
    "https://ophim8.cc",
    "https://ophim10.cc",
    "https://kkphimapi.com"
];

const IMG_DOMAINS = [
    "https://img.ophim1.com/uploads/movies/",
    "https://img.kkphim.com/uploads/movies/"
];

let currentApiBase = API_DOMAINS[0];
const API_BASE = API_DOMAINS[0];
const IMG_BASE = IMG_DOMAINS[0];
const DEFAULT_POSTER = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'200' height%3D'300' viewBox%3D'0 0 200 300'%3E%3Crect width%3D'200' height%3D'300' fill%3D'%23252830'%2F%3E%3Ctext x%3D'50%25' y%3D'50%25' dominant-baseline%3D'middle' text-anchor%3D'middle' font-family%3D'sans-serif' font-size%3D'14' fill%3D'%23555'%3EImage Error%3C%2Ftext%3E%3C%2Fsvg%3E";

// NẾU CHẠY EXTENSION: Bạn cần thay bằng domain Vercel thật của bạn ở đây
const PRODUCTION_DOMAIN = "https://lumina-play.vercel.app"; 

// Hàm Fetch thông minh: Tự động thử các Domain khác hoặc qua Proxy nếu bị chặn
async function fetchAPI(pathOrUrl, options = {}) {
    let path = pathOrUrl;
    if (pathOrUrl.startsWith('http')) {
        try {
            const urlObj = new URL(pathOrUrl);
            path = urlObj.pathname + urlObj.search;
        } catch (e) {
            path = pathOrUrl;
        }
    }

    const isExtension = window.location.protocol === 'chrome-extension:';
    const proxyBase = isExtension ? PRODUCTION_DOMAIN : "";

    for (const domain of API_DOMAINS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000); 

            let combinedSignal = controller.signal;
            if (options.signal) {
                if (typeof AbortSignal.any === 'function') {
                    combinedSignal = AbortSignal.any([controller.signal, options.signal]);
                }
            }

            const fullUrl = `${domain}${path.startsWith('/') ? '' : '/'}${path}`;
            const res = await fetch(fullUrl, { ...options, signal: combinedSignal });
            clearTimeout(timeoutId);
            if (res.ok) {
                currentApiBase = domain;
                return await res.json();
            }
        } catch (e) {
            console.warn(`Domain ${domain} lỗi: ${e.message}`);
            if (options.signal?.aborted) throw e;
        }
    }

    // Proxy fallback (Stealth Mode)
    console.log("Dùng Proxy (Stealth Mode)...");
    try {
        const targetUrl = `${API_DOMAINS[0]}${path.startsWith('/') ? '' : '/'}${path}`;
        const proxyUrl = `${proxyBase}/api/proxy?q=${btoa(targetUrl)}`;
        const res = await fetch(proxyUrl, options);
        if (!res.ok) throw new Error("Proxy error");
        return await res.json();
    } catch (err) {
        throw new Error("Không kết nối được server.");
    }
}

function getImgUrl(posterPath) {
    if (!posterPath) return DEFAULT_POSTER;
    if (posterPath.startsWith('http')) return posterPath;
    return `${IMG_DOMAINS[0]}${posterPath}`;
}
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
    const epIndex = params.get('ep');
    const startTime = params.get('t');

    const filters = [
        { id: 'selectList', type: 'danh-sach', label: 'Danh sách' },
        { id: 'selectCategory', type: 'the-loai', label: 'Thể loại' },
        { id: 'selectCountry', type: 'quoc-gia', label: 'Quốc gia' },
        { id: 'selectYear', type: 'nam-phat-hanh', label: 'Năm' }
    ];

    async function initFilters() {
        try {
            const [cats, counts, years] = await Promise.all([
                fetchAPI(`/v1/api/the-loai`),
                fetchAPI(`/v1/api/quoc-gia`),
                fetchAPI(`/v1/api/nam-phat-hanh`)
            ]);
            const getItems = (obj) => obj?.data?.items || (Array.isArray(obj?.data) ? obj.data : []);

            // 1. Danh sách
            const collectionItems = [
                { name: "Phim Mới", slug: "phim-moi" }, { name: "Phim Bộ", slug: "phim-bo" },
                { name: "Phim Lẻ", slug: "phim-le" }, { name: "TV Shows", slug: "tv-shows" },
                { name: "Hoạt Hình", slug: "hoat-hinh" }, { name: "Vietsub", slug: "phim-vietsub" },
                { name: "Thuyết Minh", slug: "phim-thuyet-minh" }, { name: "Lồng Tiếng", slug: "phim-long-tien" },
                { name: "Bộ Đang Chiếu", slug: "phim-bo-dang-chieu" }, { name: "Bộ Hoàn Thành", slug: "phim-bo-hoan-thanh" },
                { name: "Sắp Chiếu", slug: "phim-sap-chieu" }, { name: "Subteam", slug: "subteam" },
                { name: "Chiếu Rạp", slug: "phim-chieu-rap" }
            ];
            buildCustomDropdown('selectList', collectionItems, 'danh-sach', 'Danh sách');

            // 2. Thể loại
            const rawCats = getItems(cats).filter(c => c.name !== "Phim 18+");
            buildCustomDropdown('selectCategory', rawCats, 'the-loai', 'Thể loại');

            // 3. Quốc gia
            buildCustomDropdown('selectCountry', getItems(counts), 'quoc-gia', 'Quốc gia');

            // 4. Năm
            const yearsList = getItems(years).map(y => y.year || y.name || y.slug).filter(Boolean);
            const mappedYears = Array.from(new Set(yearsList)).sort((a, b) => b - a).map(y => ({ name: y, slug: y }));
            buildCustomDropdown('selectYear', mappedYears, 'nam-phat-hanh', 'Năm');
        } catch (e) { }
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
            document.querySelectorAll('.custom-select.active').forEach(s => {
                if (s !== container) s.classList.remove('active');
            });
            container.classList.toggle('active');
        };

        const defaultOpt = document.createElement('div');
        defaultOpt.className = 'option';
        defaultOpt.innerText = "Tất cả";
        defaultOpt.onclick = (e) => {
            e.stopPropagation();
            container.selectedItems = [];
            container.classList.remove('has-selection', 'active');
            triggerText.innerText = defaultLabel;
        };
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
                    triggerText.innerText = container.selectedItems.length > 2 ? `${container.selectedItems.length} mục` : names;
                    container.classList.add('has-selection');
                } else {
                    triggerText.innerText = defaultLabel;
                    container.classList.remove('has-selection');
                }
            };
            optionsBox.appendChild(opt);
        });
    }

    function applyMultiFilter() {
        const params = new URLSearchParams();
        let hasFilter = false;
        filters.forEach(f => {
            const container = document.getElementById(f.id);
            if (container?.selectedItems?.length > 0) {
                hasFilter = true;
                const key = f.type === 'the-loai' ? 'category' : (f.type === 'quoc-gia' ? 'country' : (f.type === 'nam-phat-hanh' ? 'year' : 'list'));
                const nameKey = key + 'Name';
                params.set(key, container.selectedItems.map(i => i.slug).join(','));
                params.set(nameKey, container.selectedItems.map(i => i.name).join(', '));
            }
        });
        if (hasFilter) {
            params.set('type', 'filter');
            window.location.assign(`index.html?${params.toString()}`);
        } else {
            window.location.assign('index.html');
        }
    }

    window.addEventListener('click', (e) => {
        document.querySelectorAll('.custom-select.active').forEach(c => {
            if (!c.contains(e.target)) c.classList.remove('active');
        });
    });

    // Popup Filter Logic
    const filterPopup = document.getElementById('filterPopup');
    const filterBackdrop = document.getElementById('filterPopupBackdrop');
    const filterBtn = document.getElementById('filterToggle');
    const btnReset = document.getElementById('btnReset');
    const btnApply = document.getElementById('btnApply');

    const openPopup = () => {
        filterPopup?.classList.add('active');
        filterBackdrop?.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const closePopup = () => {
        filterPopup?.classList.remove('active');
        filterBackdrop?.classList.remove('active');
        document.body.style.overflow = '';
    };

    filterBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const userDropdown = document.getElementById('userDropdown');
        userDropdown?.classList.remove('active');
        openPopup();
    });
    filterBackdrop?.addEventListener('click', closePopup);

    btnReset?.addEventListener('click', () => {
        filters.forEach(f => {
            const container = document.getElementById(f.id);
            if (container) {
                container.selectedItems = [];
                container.classList.remove('has-selection');
                container.querySelector('.select-trigger span').innerText = f.label;
                container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            }
        });
    });

    btnApply?.addEventListener('click', () => {
        applyMultiFilter();
        closePopup();
    });

    // Xử lý tìm kiếm (Redirect về home)
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== "") {
                window.location.assign(`index.html?q=${encodeURIComponent(searchInput.value.trim())}`);
            }
        });
    }

    if (slug) {
        let finalEp = epIndex;
        let finalTime = startTime;

        if (epIndex === null && startTime === null) {
            const progress = JSON.parse(localStorage.getItem('videoProgress') || "{}");
            if (progress[slug]) {
                finalEp = progress[slug].epIndex;
                finalTime = progress[slug].time;
            }
        }

        const GH_CLIENT_ID = "Ov23liDh2aDjxMY5xJ99";

        window.updateGist = async function () {
            const token = localStorage.getItem('gh_token');
            const gistId = localStorage.getItem('gh_gist_id');
            if (!token || !gistId) return;
            try {
                await fetch(`https://api.github.com/gists/${gistId}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        files: { "lumina_watch_history.json": { content: localStorage.getItem('watchHistory') || "[]" } }
                    })
                });
            } catch (e) { }
        }

        function updateUserUI(user) {
            const loginSection = document.getElementById('loginSection');
            const accountSection = document.getElementById('accountSection');
            const headerAvatar = document.getElementById('headerAvatar');
            const userIcon = document.getElementById('userIcon');
            const dropdownAvatar = document.getElementById('dropdownAvatar');
            const dropdownName = document.getElementById('dropdownName');
            const dropdownLogin = document.getElementById('dropdownLogin');

            if (user) {
                if (loginSection) loginSection.style.display = 'none';
                if (accountSection) accountSection.style.display = 'block';
                if (headerAvatar) {
                    headerAvatar.src = user.avatar_url;
                    headerAvatar.style.display = 'block';
                }
                if (userIcon) userIcon.style.display = 'none';
                if (dropdownAvatar) dropdownAvatar.src = user.avatar_url;
                if (dropdownName) dropdownName.innerText = user.name || user.login;
                if (dropdownLogin) dropdownLogin.innerText = `@${user.login}`;
            } else {
                if (loginSection) loginSection.style.display = 'block';
                if (accountSection) accountSection.style.display = 'none';
                if (headerAvatar) headerAvatar.style.display = 'none';
                if (userIcon) userIcon.style.display = 'block';
            }
        }

        function checkAuthState() {
            const token = localStorage.getItem('gh_token');
            const userStr = localStorage.getItem('gh_user');
            if (token && userStr) {
                updateUserUI(JSON.parse(userStr));
                syncHistoryWithGist(token);
            } else {
                updateUserUI(null);
            }
        }

        async function syncHistoryWithGist(token) {
            try {
                let gistId = localStorage.getItem('gh_gist_id');
                if (!gistId) return;
                const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const gistData = await res.json();
                const content = gistData.files['lumina_watch_history.json'].content;
                const remoteHistory = JSON.parse(content || "[]");
                const local = JSON.parse(localStorage.getItem('watchHistory') || "[]");
                const mergedMap = new Map();
                [...remoteHistory, ...local].forEach(item => {
                    const existing = mergedMap.get(item.slug);
                    if (!existing || item.updatedAt > existing.updatedAt) mergedMap.set(item.slug, item);
                });
                const finalHistory = Array.from(mergedMap.values()).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20);
                localStorage.setItem('watchHistory', JSON.stringify(finalHistory));
            } catch (e) { }
        }

        function initAuth() {
            const userBtn = document.getElementById('userBtn');
            const userDropdown = document.getElementById('userDropdown');
            const githubLoginBtn = document.getElementById('githubLogin');
            const logoutBtn = document.getElementById('logoutBtn');

            userBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                closePopup();
                userDropdown?.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-container')) {
                    userDropdown?.classList.remove('active');
                }
            });

            githubLoginBtn?.addEventListener('click', () => {
                const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) || '';
                const baseDir = currentDir.endsWith('/') ? currentDir : currentDir + '/';
                const redirectUri = window.location.origin + baseDir + 'callback.html';

                const url = `https://github.com/login/oauth/authorize?client_id=${GH_CLIENT_ID}&scope=gist&redirect_uri=${encodeURIComponent(redirectUri)}`;
                window.location.href = url;
            });

            logoutBtn?.addEventListener('click', () => {
                localStorage.removeItem('gh_token');
                localStorage.removeItem('gh_user');
                localStorage.removeItem('gh_gist_id');
                window.location.reload();
            });
            checkAuthState();
        }

        playMovie(slug, parseInt(finalEp || 0), parseFloat(finalTime || 0));
        initAuth();
    } else {
        window.location.href = "index.html";
    }


    initFilters();
});


async function playMovie(slug, epIndex = 0, startTime = 0) {
    showLoader(true);
    try {
        const data = await fetchAPI(`/v1/api/phim/${slug}`);
        currentMovie = data.data.item;

        document.title = `Đang xem: ${currentMovie.name} - Lumina Play`;
        document.getElementById("current-title").innerText = currentMovie.name;

        // Metadata badges
        const metaRow = document.getElementById("current-meta");
        if (metaRow) {
            metaRow.style.display = "flex";
            document.getElementById("meta-year").innerText = currentMovie.year || "";
            document.getElementById("meta-lang").innerText = currentMovie.lang || "Vietsub";
        }

        // Fetch extra info
        fetchCast(slug);
        fetchKeywords(slug);

        // Giải mã mô tả
        const descEl = document.getElementById("current-desc");
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = (currentMovie.content || "").replace(/<[^>]*>?/gm, '');
        descEl.innerText = tempDiv.textContent || "";
        descEl.classList.add('collapsed');

        // Cleanup cũ nếu load lại phim
        const oldBtn = document.querySelector('.see-more-btn');
        if (oldBtn) oldBtn.remove();

        const seeMoreBtn = document.createElement('div');
        seeMoreBtn.className = 'see-more-btn';
        seeMoreBtn.innerText = 'Xem thêm';
        descEl.parentNode.insertBefore(seeMoreBtn, descEl.nextSibling);

        // Kiểm tra xem có bị tràn (cắt bớt) không
        setTimeout(() => {
            if (descEl.scrollHeight > descEl.clientHeight) {
                seeMoreBtn.style.display = 'block';
                seeMoreBtn.onclick = () => {
                    const isCollapsed = descEl.classList.contains('collapsed');
                    if (isCollapsed) {
                        descEl.classList.remove('collapsed');
                        seeMoreBtn.innerText = 'Thu gọn';
                    } else {
                        descEl.classList.add('collapsed');
                        seeMoreBtn.innerText = 'Xem thêm';
                        // Cuộn nhẹ lên đầu mô tả nếu đang ở xa
                        descEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                };
            } else {
                seeMoreBtn.style.display = 'none';
            }
        }, 200);

        const epSection = document.getElementById("episodes-section");
        episodesGrid.innerHTML = "";
        if (epSection) epSection.style.display = "none";
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
                if (epSection) epSection.style.display = "block";
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
        
        // Cố gắng Auto play ngay lập tức
        const attemptPlay = () => {
            video.play().catch(err => {
                console.log("Autoplay blocked, waiting for user interaction or muted playback.");
                // Nếu bị block (thường do chính sách trình duyệt), thử Play ở chế độ MUTE
                video.muted = true;
                video.play().catch(() => { });
                
                // Hiển thị một thông báo nhỏ hoặc để người dùng tự bấm Unmute (nếu cần)
                // Tuy nhiên, thường thì video sẽ chạy nhưng không có tiếng.
            });
        };
        attemptPlay();
    };

    // Ưu tiên dùng Native HLS của Safari (Apple) để Auto PiP ổn định nhất khi vuốt lên
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', startPlay, { once: true });
    } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, startPlay);
    } else {
        // Fallback cuối cùng cho các browser cổ
        video.src = url;
        video.addEventListener('loadedmetadata', startPlay, { once: true });
    }

    video.autoPictureInPicture = true;

    // --- Chế độ Auto-PiP khi chuyển Tab (Desktop & Mobile) ---
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            if (video && !video.paused && video.readyState >= 2) {
                try {
                    if (video.requestPictureInPicture) {
                        video.requestPictureInPicture().catch(() => { });
                    } else if (video.webkitSetPresentationMode) {
                        // Fallback cho Safari
                        video.webkitSetPresentationMode('picture-in-picture');
                    }
                } catch (e) { }
            }
        } else {
            // Khi quay lại tab, tự động thoát PiP
            if (document.pictureInPictureElement === video) {
                try { document.exitPictureInPicture().catch(() => { }); } catch (e) { }
            } else if (video.webkitPresentationMode === 'picture-in-picture') {
                try { video.webkitSetPresentationMode('inline'); } catch (e) { }
            }
        }
    });

    // --- Media Session Metadata (Hiện tên phim thay vì URL trong cửa sổ PiP) ---
    if ('mediaSession' in navigator && currentMovie) {
        const fullPoster = getImgUrl(currentMovie.poster_url);

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentMovie.name,
            artist: 'Lumina Play',
            album: currentEpName ? `Phim ${currentMovie.name} - Tập ${currentEpName}` : currentMovie.name,
            artwork: [
                { src: fullPoster, sizes: '512x512', type: 'image/jpeg' },
                { src: fullPoster, sizes: '256x256', type: 'image/jpeg' }
            ]
        });
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

    // 1. Lưu vào Danh sách hiển thị (Watch History)
    let history = JSON.parse(localStorage.getItem('watchHistory') || "[]");
    const entry = {
        slug: currentMovie.slug,
        name: currentMovie.name,
        origin_name: currentMovie.origin_name,
        poster: currentMovie.poster_url,
        epName: currentEpName,
        epIndex: currentEpIndex,
        time: video.currentTime,
        duration: video.duration,
        updatedAt: Date.now()
    };
    history = history.filter(h => h.slug !== entry.slug);
    history.unshift(entry);
    if (history.length > 20) history.pop();
    localStorage.setItem('watchHistory', JSON.stringify(history));
    updateGist(); // Sync lên mây

    // 2. Lưu vào Kho lưu trữ Tiến độ thực tế (Video Progress - Không bị xóa khi xóa hiển thị)
    let progress = JSON.parse(localStorage.getItem('videoProgress') || "{}");
    progress[currentMovie.slug] = {
        epIndex: currentEpIndex,
        time: video.currentTime,
        updatedAt: Date.now()
    };
    localStorage.setItem('videoProgress', JSON.stringify(progress));
}

function showLoader(show) {
    if (loader) loader.className = show ? "loader active" : "loader";
}

async function fetchRelatedMovies(movie) {
    if (!movie) return;
    try {
        const nameParts = movie.name.split(' ');
        const searchKeyword = nameParts.slice(0, 3).join(' ');
        const categorySlug = movie.category && movie.category.length > 0 ? movie.category[0].slug : '';
        const [searchData, catData] = await Promise.all([
            fetchAPI(`/v1/api/tim-kiem?keyword=${encodeURIComponent(searchKeyword)}`).catch(() => null),
            categorySlug ? fetchAPI(`/v1/api/the-loai/${categorySlug}`).catch(() => null) : Promise.resolve(null)
        ]);

        let searchItems = searchData?.data?.items || [];
        let catItems = catData?.data?.items || [];
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
        let poster = getImgUrl(movie.poster_url || movie.thumb_url);
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
                <div class="movie-rating">
                    <i class="fa-solid fa-star"></i>
                    <span>${rating}</span>
                </div>
                <div class="badge-ep">${epStatus}</div>
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
            if (img.src !== DEFAULT_POSTER && !img.dataset.proxied) {
                console.warn("Thử load ảnh liên quan qua Proxy...");
                img.dataset.proxied = "true";
                img.src = `/api/proxy?url=${encodeURIComponent(poster)}`;
            } else {
                img.src = DEFAULT_POSTER;
            }
        });
        card.onclick = () => {
            window.location.assign(`player.html?slug=${movie.slug}`);
        };
        grid.appendChild(card);
    });
}

/** 
 * NEW: Fetch cast & people from API
 */
async function fetchCast(slug) {
    const section = document.getElementById('castSection');
    const list = document.getElementById('castList');
    if (!section || !list) return;

    try {
        const data = await fetchAPI(`/v1/api/phim/${slug}/peoples`);

        if (data.success && data.data.peoples && data.data.peoples.length > 0) {
            section.style.display = 'block';
            list.innerHTML = '';

            const TMDB_IMG = "https://image.tmdb.org/t/p/w185";
            data.data.peoples.forEach(person => {
                const item = document.createElement('div');
                item.className = 'cast-item';
                item.style.cursor = 'pointer';
                const avatar = person.profile_path ? `${TMDB_IMG}${person.profile_path}` : DEFAULT_POSTER;

                item.innerHTML = `
                    <img class="cast-avatar" src="${avatar}" alt="${person.name}" loading="lazy">
                    <div class="cast-name">${person.name}</div>
                    <div class="cast-role">${person.character || 'Director'}</div>
                `;
                item.onclick = () => {
                    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(person.name)}`;
                    window.open(googleUrl, '_blank');
                };
                list.appendChild(item);
            });
        } else {
            section.style.display = 'none';
        }
    } catch (e) {
        section.style.display = 'none';
    }
}

/** 
 * NEW: Fetch keywords from API
 */
async function fetchKeywords(slug) {
    const container = document.getElementById('keywords-container');
    if (!container) return;

    container.innerHTML = '';
    const addedSlugs = new Set();

    const addTag = (name, slug, type) => {
        if (addedSlugs.has(slug)) return;
        addedSlugs.add(slug);

        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerText = name;
        tag.onclick = () => {
            const key = type === 'the-loai' ? 'category' : (type === 'quoc-gia' ? 'country' : (type === 'nam-phat-hanh' ? 'year' : 'list'));
            window.location.assign(`index.html?type=filter&${key}=${slug}&${key}Name=${encodeURIComponent(name)}`);
        };
        container.appendChild(tag);
    };

    if (currentMovie) {
        // 1. Phân loại theo Type (Danh sách chính)
        const typeMapping = {
            'series': { name: 'Phim Bộ', slug: 'phim-bo' },
            'single': { name: 'Phim Lẻ', slug: 'phim-le' },
            'hoathinh': { name: 'Hoạt Hình', slug: 'hoat-hinh' },
            'tvshows': { name: 'TV Shows', slug: 'tv-shows' }
        };
        const mainType = typeMapping[currentMovie.type];
        if (mainType) addTag(mainType.name, mainType.slug, 'list');

        // 2. Phân loại theo Ngôn ngữ (Dựa trên list dropdown của user)
        if (currentMovie.lang) {
            const l = currentMovie.lang.toLowerCase();
            if (l.includes('vietsub')) addTag('Vietsub', 'phim-vietsub', 'list');
            if (l.includes('thuyết minh')) addTag('Thuyết Minh', 'phim-thuyet-minh', 'list');
            if (l.includes('lồng tiếng')) addTag('Lồng Tiếng', 'phim-long-tien', 'list');
        }

        // 3. Phân loại theo Trạng thái (Ongoing/Completed/Trailer)
        if (currentMovie.status === 'ongoing') {
            addTag('Đang Chiếu', 'phim-bo-dang-chieu', 'list');
        } else if (currentMovie.status === 'completed') {
            addTag('Hoàn Thành', 'phim-bo-hoan-thanh', 'list');
        } else if (currentMovie.status === 'trailer') {
            addTag('Sắp Chiếu', 'phim-sap-chieu', 'list');
        }

        // 4. Các danh sách đặc biệt
        if (currentMovie.year === new Date().getFullYear().toString()) {
            addTag('Phim Mới', 'phim-moi', 'list');
        }
        if (currentMovie.chieu_rap === true || currentMovie.chieu_rap === "1") {
            addTag('Chiêu Rạp', 'phim-chieu-rap', 'list');
        }

        // 5. Hiện Thể loại (Genre)
        if (currentMovie.category) {
            currentMovie.category.forEach(cat => {
                addTag(cat.name, cat.slug, 'the-loai');
            });
        }
    }
}

// --- Anti-DevTools (Security Shield) ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) e.preventDefault();
});
