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

let contentAbortController = new AbortController();

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

    // Thử domain chính và dự phòng trước
    for (const domain of API_DOMAINS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s là đủ cho gói tin API nhỏ
            
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
            
            // CHIẾN THUẬT NHANH: Nếu domain đầu tiên bị chặn mạng hoàn toàn (NET::ERR...)
            // thì nhảy thẳng sang Proxy luôn cho nhanh.
            if (domain === API_DOMAINS[0] && (e.name === 'TypeError' || e.message.includes('fetch'))) {
                console.log("Mạng công ty chặn gắt, dùng Proxy ngay...");
                break; 
            }
        }
    }

    // Proxy fallback (Stealth Mode: Encode Base64 để vượt tường lửa công ty)
    console.log("Dùng Proxy (Stealth Mode)...");
    try {
        const targetUrl = `${API_DOMAINS[0]}${path.startsWith('/') ? '' : '/'}${path}`;
        const proxyUrl = `${proxyBase}/api/proxy?q=${btoa(targetUrl)}`;
        const res = await fetch(proxyUrl, options);
        if (!res.ok) throw new Error("Proxy error");
        return await res.json();
    } catch (err) {
        throw new Error("Không thể kết nối.");
    }
}

// Hàm lấy ảnh thông minh
function getImgUrl(posterPath) {
    if (!posterPath) return DEFAULT_POSTER;
    if (posterPath.startsWith('http')) return posterPath;
    return `${IMG_DOMAINS[0]}${posterPath}`;
}

const movieGrid = document.getElementById("movieGrid");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("searchInput");

// Kiểm soát cuộn thủ công để tránh bị nhảy (jump) khi Back
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('lumina_scroll_pos', window.scrollY);
});

const navType = performance.getEntriesByType('navigation')[0]?.type;
if (navType !== 'back_forward') {
    window.scrollTo(0, 0);
}
const sectionHeader = document.querySelector(".section-header");
const listTitle = document.getElementById("list-title");
const listSeeMore = document.getElementById("listSeeMore");
const recentSeeMore = document.getElementById("recentSeeMore");

// Biến điều khiển infinite scroll toàn cục
let mainObserver = null;
let scrollSentinel = document.getElementById('scrollSentinel');

function updateMainObserver(isGridMode) {
    if (!scrollSentinel) scrollSentinel = document.getElementById('scrollSentinel');
    if (mainObserver) mainObserver.disconnect();

    mainObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
            currentPage++;
            loadContent(currentPage);
        }
    }, {
        root: isGridMode ? null : movieGrid,
        threshold: 0.1
    });

    if (scrollSentinel) mainObserver.observe(scrollSentinel);
}

// Cấu hình lọc
const filters = [
    { id: 'selectList', type: 'danh-sach', label: 'Danh sách' },
    { id: 'selectCategory', type: 'the-loai', label: 'Thể loại' },
    { id: 'selectCountry', type: 'quoc-gia', label: 'Quốc gia' },
    { id: 'selectYear', type: 'nam-phat-hanh', label: 'Năm' }
];

function handleUrlParams() {
    const p = new URLSearchParams(window.location.search);
    const q = p.get('q');
    const t = p.get('type');

    if (listTitle) listTitle.innerText = "";

    // Reset trạng thái trước khi nạp mới
    state.type = 'home';
    state.query = '';
    state.category = { slugs: '', names: '' };
    state.country = { slugs: '', names: '' };
    state.year = { slugs: '', names: '' };
    state.list = { slugs: '', names: '' };
    // searchInput might not be available yet if called before DOMContentLoaded, but usually it's called after
    if (searchInput) {
        searchInput.value = q || '';
        if (searchInput.parentElement) {
            searchInput.parentElement.classList.toggle('active', !!q);
        }
    }

    // Reset giao diện bộ lọc về mặc định
    filters.forEach(f => {
        const container = document.getElementById(f.id);
        if (container) {
            const triggerText = container.querySelector('.select-trigger span');
            if (triggerText) triggerText.innerText = f.label;
            container.classList.remove('has-selection');
        }
    });

    if (q) {
        state.type = 'search';
        state.query = q;
        listTitle.innerText = `Tìm kiếm: ${q}`;
        loadContent(1);
    } else if (t === 'history') {
        state.type = 'history';
        listTitle.innerText = "Lịch sử đã xem";
        loadContent(1);
    } else if (t === 'filter') {
        state.type = 'filter';
        state.category.slugs = p.get('category') || '';
        state.category.names = p.get('catName') || '';
        state.country.slugs = p.get('country') || '';
        state.country.names = p.get('countryName') || '';
        state.year.slugs = p.get('year') || '';
        state.year.names = p.get('yearName') || '';
        state.list.slugs = p.get('list') || '';
        state.list.names = p.get('listName') || '';

        let titleParts = [];
        if (state.category.names) titleParts.push(state.category.names);
        if (state.country.names) titleParts.push(state.country.names);
        if (state.year.names) titleParts.push(`Năm ${state.year.names}`);
        if (state.list.names) titleParts.push(state.list.names);
        listTitle.innerText = titleParts.length > 0 ? titleParts.join(' | ') : "Bộ lọc phim";

        loadContent(1);

        // Khôi phục UI và state cho từng dropdown
        filters.forEach(f => {
            const container = document.getElementById(f.id);
            if (!container) return;
            const triggerText = container.querySelector('.select-trigger span');

            // Reset trước khi nạp
            container.selectedItems = [];
            container.classList.remove('has-selection');
            container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));

            let val = null;
            if (f.type === 'the-loai') val = state.category;
            else if (f.type === 'quoc-gia') val = state.country;
            else if (f.type === 'nam-phat-hanh') val = state.year;
            else if (f.type === 'danh-sach') val = state.list;

            if (val && val.slugs) {
                const slugs = val.slugs.split(',');
                const names = val.names.split(', ');

                slugs.forEach((slug, i) => {
                    container.selectedItems.push({ slug, name: names[i] || slug });
                });

                container.classList.add('has-selection');
                triggerText.innerText = slugs.length > 2 ? `${slugs.length} mục đã chọn` : val.names;

                container.querySelectorAll('.option').forEach(opt => {
                    if (slugs.includes(opt.dataset.slug)) opt.classList.add('selected');
                });
            } else {
                triggerText.innerText = f.label;
            }
        });
    } else {
        state.type = 'home';
        listTitle.innerText = "Phim Mới Cập Nhật";
        if (listSeeMore) {
            listSeeMore.href = "index.html?type=filter&list=phim-moi&listName=Phim+Mới";
            listSeeMore.style.display = "flex";
        }
        loadContent(1);
    }
    renderWatchHistory();
}


document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const type = params.get('type');
    // Filter Toggle Logic
    // Popup Filter Logic (New)
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

    // Nếu đang mở mà có di chuyển chuột, cũng coi như đang "làm gì đó"

    initFilters();
    renderWatchHistory();

    // --- LOGIC SLIDER NGANG (Dùng Delegation cho nhiều Section) ---
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.slider-btn');
        if (!btn) return;

        const wrapper = btn.closest('.movie-slider-wrapper');
        const grid = wrapper.querySelector('.movie-grid');
        if (!grid) return;

        const scrollAmount = window.innerWidth * 0.8;
        if (btn.classList.contains('prev')) {
            grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });

    document.addEventListener('scroll', (e) => {
        if (e.target.classList?.contains('movie-grid')) {
            updateSliderArrows(e.target);
        }
    }, true);

    function updateSliderArrows(grid) {
        const wrapper = grid.closest('.movie-slider-wrapper');
        if (!wrapper) return;

        const sliderPrev = wrapper.querySelector('.slider-btn.prev');
        const sliderNext = wrapper.querySelector('.slider-btn.next');
        const scrollLeft = grid.scrollLeft;
        const maxScroll = grid.scrollWidth - grid.clientWidth;

        if (sliderPrev) {
            if (scrollLeft > 20) sliderPrev.classList.add('visible');
            else sliderPrev.classList.remove('visible');
        }
        if (sliderNext) {
            if (scrollLeft < maxScroll - 20) sliderNext.classList.add('visible');
            else sliderNext.classList.remove('visible');
        }
    }

    // Khởi tạo lần đầu mặc định là slider (home)
    updateMainObserver(false);
    const GH_CLIENT_ID = "Ov23liDh2aDjxMY5xJ99";

    function initAuth() {
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        const loginSection = document.getElementById('loginSection');
        const accountSection = document.getElementById('accountSection');
        const githubLoginBtn = document.getElementById('githubLogin');
        const logoutBtn = document.getElementById('logoutBtn');

        // Toggle Dropdown
        userBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopup();
            userDropdown?.classList.toggle('active');
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-container')) {
                userDropdown?.classList.remove('active');
            }
        });

        // Login logic
        githubLoginBtn?.addEventListener('click', () => {
            const redirectUri = window.location.origin + window.location.pathname.replace('index.html', 'callback.html');
            const url = `https://github.com/login/oauth/authorize?client_id=${GH_CLIENT_ID}&scope=gist&redirect_uri=${encodeURIComponent(redirectUri)}`;
            window.location.href = url;
        });

        // Logout logic
        logoutBtn?.addEventListener('click', () => {
            localStorage.removeItem('gh_token');
            localStorage.removeItem('gh_user');
            localStorage.removeItem('gh_gist_id');
            window.location.reload();
        });

        checkAuthState();
    }

    function checkAuthState() {
        const token = localStorage.getItem('gh_token');
        const userStr = localStorage.getItem('gh_user');

        if (token && userStr) {
            const user = JSON.parse(userStr);
            updateUserUI(user);
            syncHistoryWithGist(token);
        } else {
            updateUserUI(null);
        }
    }

    // --- LOGIC SYNC GIST ---
    async function syncHistoryWithGist(token) {
        try {
            let gistId = localStorage.getItem('gh_gist_id');
            let remoteHistory = [];

            if (!gistId) {
                // Tìm Gist hiện có trong danh sách Gist của User
                const res = await fetch('https://api.github.com/gists', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const gists = await res.json();
                const luminaGist = gists.find(g => g.files['lumina_watch_history.json']);

                if (luminaGist) {
                    gistId = luminaGist.id;
                    localStorage.setItem('gh_gist_id', gistId);
                }
            }

            if (gistId) {
                // Fetch nội dung Gist
                const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const gistData = await res.json();
                const content = gistData.files['lumina_watch_history.json'].content;
                remoteHistory = JSON.parse(content || "[]");
            } else {
                // Tạo Gist mới nếu chưa có
                const res = await fetch('https://api.github.com/gists', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        description: "Lumina Play Watch History (Private)",
                        public: false,
                        files: {
                            "lumina_watch_history.json": {
                                content: localStorage.getItem('watchHistory') || "[]"
                            }
                        }
                    })
                });
                const newGist = await res.json();
                gistId = newGist.id;
                localStorage.setItem('gh_gist_id', gistId);
                return; // Vừa tạo xong, data local đã mới nhất
            }

            // Merge dữ liệu
            mergeHistory(remoteHistory);
        } catch (err) {
            console.error("Sync Error:", err);
        }
    }

    function mergeHistory(remote) {
        const local = JSON.parse(localStorage.getItem('watchHistory') || "[]");

        // Merge theo slug, ưu tiên cái có updatedAt mới hơn
        const mergedMap = new Map();
        [...remote, ...local].forEach(item => {
            const existing = mergedMap.get(item.slug);
            if (!existing || item.updatedAt > existing.updatedAt) {
                mergedMap.set(item.slug, item);
            }
        });

        const finalHistory = Array.from(mergedMap.values())
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 20);

        localStorage.setItem('watchHistory', JSON.stringify(finalHistory));
        renderWatchHistory();
    }

    async function updateGist() {
        const token = localStorage.getItem('gh_token');
        const gistId = localStorage.getItem('gh_gist_id');
        if (!token || !gistId) return;

        try {
            await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        "lumina_watch_history.json": {
                            content: localStorage.getItem('watchHistory') || "[]"
                        }
                    }
                })
            });
        } catch (err) {
            console.error("Update Gist Error:", err);
        }
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
            loginSection.style.display = 'none';
            accountSection.style.display = 'block';

            if (headerAvatar) {
                headerAvatar.src = user.avatar_url;
                headerAvatar.style.display = 'block';
            }
            if (userIcon) userIcon.style.display = 'none';

            if (dropdownAvatar) dropdownAvatar.src = user.avatar_url;
            if (dropdownName) dropdownName.innerText = user.name || user.login;
            if (dropdownLogin) dropdownLogin.innerText = `@${user.login}`;
        } else {
            loginSection.style.display = 'block';
            accountSection.style.display = 'none';
            if (headerAvatar) headerAvatar.style.display = 'none';
            if (userIcon) userIcon.style.display = 'block';
        }
    }

    // Xử lý nạp lần đầu & Back/Forward
    handleUrlParams();
    window.addEventListener('popstate', handleUrlParams);

    initAuth();

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== "") {
            const q = searchInput.value.trim();
            const queryUrl = `index.html?q=${encodeURIComponent(q)}`;
            history.pushState({}, '', queryUrl);
            handleUrlParams();
        }
    });
});


async function initFilters() {
    try {
        const [cats, counts, years] = await Promise.all([
            fetchAPI(`/v1/api/the-loai`),
            fetchAPI(`/v1/api/quoc-gia`),
            fetchAPI(`/v1/api/nam-phat-hanh`)
        ]);

        const getItems = (obj) => {
            if (!obj || !obj.data) return [];
            return Array.isArray(obj.data) ? obj.data : (obj.data.items || []);
        };

        // 1. Danh sách (Manual populate)
        const collectionItems = [
            { name: "Phim Mới", slug: "phim-moi" },
            { name: "Phim Bộ", slug: "phim-bo" },
            { name: "Phim Lẻ", slug: "phim-le" },
            { name: "TV Shows", slug: "tv-shows" },
            { name: "Hoạt Hình", slug: "hoat-hinh" },
            { name: "Anime", slug: "anime" },
            { name: "Vietsub", slug: "phim-vietsub" },
            { name: "Thuyết Minh", slug: "phim-thuyet-minh" },
            { name: "Lồng Tiếng", slug: "phim-long-tien" },
            { name: "Bộ Đang Chiếu", slug: "phim-bo-dang-chieu" },
            { name: "Bộ Hoàn Thành", slug: "phim-bo-hoan-thanh" },
            { name: "Sắp Chiếu", slug: "phim-sap-chieu" },
            { name: "Subteam", slug: "subteam" },
            { name: "Chiếu Rạp", slug: "phim-chieu-rap" }
        ];
        buildCustomDropdown('selectList', collectionItems, 'danh-sach', 'Danh sách');

        // 2. Thể loại
        const rawCats = getItems(cats).filter(c => c.name !== "Phim 18+");
        buildCustomDropdown('selectCategory', rawCats, 'the-loai', 'Thể loại');

        // 3. Quốc gia
        buildCustomDropdown('selectCountry', getItems(counts), 'quoc-gia', 'Quốc gia');

        // 4. Năm
        const yearsList = getItems(years).map(y => (typeof y === 'object' ? (y.year || y.name || y.slug) : y)).filter(Boolean);
        const uniqueYears = Array.from(new Set(yearsList)).sort((a, b) => b - a).map(y => ({ name: y, slug: y }));
        buildCustomDropdown('selectYear', uniqueYears, 'nam-phat-hanh', 'Năm');

    } catch (e) {
        console.error("Filter Init Error:", e);
    }
}


function buildCustomDropdown(containerId, items, type, defaultLabel) {
    const container = document.getElementById(containerId);
    const trigger = container.querySelector('.select-trigger');
    const optionsBox = container.querySelector('.options-container');
    const triggerText = trigger.querySelector('span');

    // BẢO TỒN DỮ LIỆU: Nếu handleUrlParams đã load trước và có giá trị, thì giữ lại
    container.selectedItems = container.selectedItems || [];

    trigger.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-select.active').forEach(s => {
            if (s !== container) s.classList.remove('active');
        });
        container.classList.toggle('active');
    };

    // Option "Tất cả" - Reset toàn bộ dropdown này
    const defaultOpt = document.createElement('div');
    defaultOpt.className = 'option';
    defaultOpt.innerText = "Tất cả";
    defaultOpt.onclick = (e) => {
        e.stopPropagation();
        container.selectedItems = [];
        container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        triggerText.innerText = defaultLabel;
        container.classList.remove('has-selection', 'active');
    };
    optionsBox.appendChild(defaultOpt);

    items.forEach(item => {
        const opt = document.createElement('div');
        opt.className = 'option';
        opt.innerText = item.name;
        opt.dataset.slug = item.slug;
        opt.dataset.name = item.name;

        // Nếu handleUrlParams đã chọn mục này từ trước (Race condition fix)
        if (container.selectedItems.some(i => i.slug === item.slug)) {
            opt.classList.add('selected');
        }

        opt.onclick = (e) => {
            e.stopPropagation();

            // Logic Chọn nhiều (Toggle)
            const idx = container.selectedItems.findIndex(i => i.slug === item.slug);
            if (idx > -1) {
                container.selectedItems.splice(idx, 1);
                opt.classList.remove('selected');
            } else {
                container.selectedItems.push(item);
                opt.classList.add('selected');
            }

            // Cập nhật nhãn tạm thời trên nút trigger
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

function applyMultiFilter() {
    const selections = {};
    filters.forEach(f => {
        const container = document.getElementById(f.id);
        if (container && container.selectedItems && container.selectedItems.length > 0) {
            selections[f.type] = {
                slugs: container.selectedItems.map(i => i.slug).join(','),
                names: container.selectedItems.map(i => i.name).join(', ')
            };
        }
    });

    const p = new URLSearchParams();
    p.set('type', 'filter');
    if (selections['the-loai']) {
        p.set('category', selections['the-loai'].slugs);
        p.set('catName', selections['the-loai'].names);
    }
    if (selections['quoc-gia']) {
        p.set('country', selections['quoc-gia'].slugs);
        p.set('countryName', selections['quoc-gia'].names);
    }
    if (selections['nam-phat-hanh']) {
        p.set('year', selections['nam-phat-hanh'].slugs);
        p.set('yearName', selections['nam-phat-hanh'].names);
    }
    if (selections['danh-sach']) {
        p.set('list', selections['danh-sach'].slugs);
        p.set('listName', selections['danh-sach'].names);
    }

    if (p.toString() === "type=filter") {
        history.pushState({}, '', 'index.html');
    } else {
        history.pushState({}, '', `index.html?${p.toString()}`);
    }
    handleUrlParams();
}

window.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-select.active').forEach(container => {
        if (!container.contains(e.target)) {
            container.classList.remove('active');
        }
    });
});

// --- Hệ thống Cache & Pre-fetching (Chuẩn OPhim Core) ---
// Cache API trong phiên (persists across back/forward)
const SESSION_CACHE_KEY = 'lumina_api_cache_v1';
function getSessionCache() {
    try {
        const d = sessionStorage.getItem(SESSION_CACHE_KEY);
        return d ? JSON.parse(d) : {};
    } catch (e) { return {}; }
}
function setSessionCache(url, data) {
    try {
        const cache = getSessionCache();
        cache[url] = data;
        const keys = Object.keys(cache);
        if (keys.length > 50) delete cache[keys[0]];
        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cache));
    } catch (e) { }
}
const apiCache = {
    has: (url) => !!getSessionCache()[url],
    get: (url) => getSessionCache()[url],
    set: (url, data) => setSessionCache(url, data)
};
let isFetching = false;
let hasMore = true;

const state = {
    type: 'home',
    page: 1,
    query: '',
    category: { slugs: '', names: '' },
    country: { slugs: '', names: '' },
    year: { slugs: '', names: '' },
    list: { slugs: '', names: '' }
};

// Khởi tạo Intersection Observer cho Infinite Scroll
const sentinel = document.getElementById('scrollSentinel');
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isFetching && hasMore) {
        loadContent(state.page + 1);
    }
}, { threshold: 0.1 });

if (sentinel) observer.observe(sentinel);

async function loadContent(page = 1) {
    if (isFetching || (!hasMore && page > 1)) return;

    if (page === 1) {
        hasMore = true;
        contentAbortController?.abort();
        contentAbortController = new AbortController();
    }

    const signal = contentAbortController.signal;
    let urls = [];

    state.page = page;

    // Reset kết quả nếu là trang 1
    if (page === 1) {
        movieGrid.innerHTML = "";
        if (scrollSentinel) scrollSentinel.style.display = "";

        document.querySelectorAll('.movie-section-block').forEach(el => el.remove());

        const movieContent = document.getElementById('movieContent');
        const recentSection = document.getElementById('recentSection');

        if (state.type === 'home') {
            movieContent.classList.remove('search-mode');
            recentSection.style.display = 'block';
            updateMainObserver(false); // Mode 1 hàng ngang
            await renderHomeSections();
        } else if (state.type === 'history') {
            movieContent.classList.add('search-mode');
            recentSection.style.display = 'none';
            updateMainObserver(true);
        } else {
            movieContent.classList.add('search-mode');
            recentSection.style.display = 'none';
            updateMainObserver(true); // Mode nhiều hàng (grid)
        }
    }

    // Xác định bộ URL cần nạp
    if (state.type === 'home') {
        urls = [`${API_BASE}/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`];
    } else if (state.type === 'history') {
        // Nạp từ localStorage
        const local = JSON.parse(localStorage.getItem('watchHistory') || "[]");
        renderMovies(local);
        hasMore = false;
        if (scrollSentinel) scrollSentinel.style.display = 'none';
        showLoader(false);
        return;
    } else if (state.type === 'search') {
        urls = [`${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(state.query)}&page=${page}`];
    } else if (state.type === 'filter') {
        const catSlug = state.category.slugs;
        const countrySlug = state.country.slugs;
        const yearSlug = state.year.slugs;
        const listSlug = state.list.slugs;

        if (listSlug) {
            const slugs = listSlug.split(',');
            urls = slugs.map(s => {
                let url = `${API_BASE}/v1/api/danh-sach/${s}?page=${page}`;
                // Các endpoint danh sách thường chỉ cho phép filter thêm category/country tùy API version
                // ở đây ta cứ add vào cho linh hoạt
                if (catSlug) url += `&category=${encodeURIComponent(catSlug)}`;
                if (countrySlug) url += `&country=${encodeURIComponent(countrySlug)}`;
                if (yearSlug) url += `&year=${encodeURIComponent(yearSlug)}`;
                return url;
            });
        } else if (catSlug) {
            const slugs = catSlug.split(',');
            urls = slugs.map(s => {
                const isSpecial = ['phim-le', 'phim-bo', 'phim-moi', 'hoan-thanh', 'sap-chieu'].includes(s);
                const baseUrl = isSpecial ? `${API_BASE}/v1/api/danh-sach` : `${API_BASE}/v1/api/the-loai`;
                let url = `${baseUrl}/${s}?page=${page}`;
                if (countrySlug) url += `&country=${encodeURIComponent(countrySlug)}`;
                if (yearSlug) url += `&year=${encodeURIComponent(yearSlug)}`;
                return url;
            });
        } else if (countrySlug) {
            const slugs = countrySlug.split(',');
            urls = slugs.map(s => {
                let url = `${API_BASE}/v1/api/quoc-gia/${s}?page=${page}`;
                if (yearSlug) url += `&year=${encodeURIComponent(yearSlug)}`;
                return url;
            });
        } else if (yearSlug) {
            const slugs = yearSlug.split(',');
            urls = slugs.map(s => `${API_BASE}/v1/api/nam-phat-hanh/${s}?page=${page}`);
        } else {
            urls = [`${API_BASE}/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`];
        }
    }

    isFetching = true;
    showSkeletons(true);

    try {
        // TẢI SONG SONG (Promise.all)
        const responses = await Promise.all(urls.map(url => {
            if (apiCache.has(url)) return Promise.resolve(apiCache.get(url));
            return fetchAPI(url, { signal }).then(data => {
                // Kiểm tra data hợp lệ trước khi cache
                if (data && data.data) {
                    apiCache.set(url, data);
                }
                return data;
            });
        }));

        // GỘP VÀ LOẠI BỎ TRÙNG LẶP (Deduplication)
        let allItems = [];
        let totalLimit = 0;

        responses.forEach(data => {
            const items = data.data.items || [];
            allItems = [...allItems, ...items];
            const paging = data.data.params.pagination;
            if (page >= paging.totalPages) totalLimit++;
        });

        // Sử dụng Map để lọc trùng theo Slug phim
        const uniqueMap = new Map();
        allItems.forEach(item => {
            if (!uniqueMap.has(item.slug)) uniqueMap.set(item.slug, item);
        });
        const finalItems = Array.from(uniqueMap.values());

        if (finalItems.length === 0 || totalLimit === responses.length || finalItems.length < 24) {
            hasMore = false;
            // Ẩn sentinel khi đã hết phim để tránh hiện skeleton/loading thừa
            if (scrollSentinel) scrollSentinel.style.display = 'none';
        }

        if (page === 1) {
            if (state.type === 'home') {
                listTitle.innerText = "Phim Mới Cập Nhật";
                if (listSeeMore) {
                    listSeeMore.href = "index.html?type=filter&list=phim-moi&listName=Phim+Mới";
                    listSeeMore.style.display = "flex";
                }
            } else if (state.type === 'history') {
                listTitle.innerText = "Lịch Sử Xem";
                if (listSeeMore) listSeeMore.style.display = "none";
            } else if (state.type === 'search') {
                listTitle.innerText = `Tìm kiếm: ${state.query}`;
                if (listSeeMore) listSeeMore.style.display = "none";
            } else if (state.type === 'filter') {
                let titleParts = [];
                if (state.category.names) titleParts.push(state.category.names);
                if (state.country.names) titleParts.push(state.country.names);
                if (state.year.names) titleParts.push(`Năm ${state.year.names}`);
                if (state.list.names) titleParts.push(state.list.names);
                listTitle.innerText = titleParts.length > 0 ? titleParts.join(' | ') : "Bộ lọc phim";
                if (listSeeMore) listSeeMore.style.display = "none";
            }
        }

        renderMovies(finalItems, page === 1);

        // Khôi phục vị trí cuộn NGAY LẬP TỨC sau khi render xong (chỉ trang đầu)
        if (page === 1 && navType === 'back_forward') {
            const savedPos = sessionStorage.getItem('lumina_scroll_pos');
            if (savedPos) {
                // Tắt tạm thời hiệu ứng smooth scroll nếu có để snap tức thì
                document.documentElement.style.scrollBehavior = 'auto';
                window.scrollTo({ top: parseInt(savedPos), behavior: 'instant' });
                // Trả lại trạng thái sau 1 frame
                requestAnimationFrame(() => {
                    document.documentElement.style.scrollBehavior = '';
                });
            }
            // Hiện trang lại sau khi đã snap xong vị trí cũ
            document.documentElement.classList.remove('back-nav-hiding');
        }

    } catch (e) {
        if (e.name === 'AbortError') {
            console.log("Request aborted");
            return; // Không làm gì cả vì đã có yêu cầu mới thay thế
        }
        console.error("Load Content Error:", e);
    } finally {
        if (!signal.aborted) {
            isFetching = false;
            showLoader(false);
        }
    }
}

async function prefetchNextPage(nextPage) {
    let nextUrl = "";
    if (state.type === 'home') nextUrl = `${API_BASE}/v1/api/danh-sach/phim-moi-cap-nhat?page=${nextPage}`;
    else if (state.type === 'search') nextUrl = `${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(state.query)}&page=${nextPage}`;
    else if (state.type === 'filter') nextUrl = `${API_BASE}/v1/api/${state.query}/${state.slug}?page=${nextPage}`;

    if (apiCache.has(nextUrl)) return;

    try {
        const res = await fetch(nextUrl);
        const data = await res.json();
        apiCache.set(nextUrl, data);
        console.log(`Pre-fetched: Page ${nextPage}`);
    } catch (e) { }
}

function sortMoviesNewest(items) {
    return items.sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearB !== yearA) return yearB - yearA;

        const timeA = a.modified && a.modified.time ? new Date(a.modified.time).getTime() : 0;
        const timeB = b.modified && b.modified.time ? new Date(b.modified.time).getTime() : 0;
        return timeB - timeA;
    });
}

function processMovieData(data, page) {
    let items = data.data.items || [];
    const paging = data.data.params.pagination;

    sortMoviesNewest(items);

    if (items.length === 0 || page >= paging.totalPages || items.length < 24) {
        hasMore = false;
        if (scrollSentinel) scrollSentinel.style.display = 'none';
        showLoader(false);
    }

    renderMovies(items, page === 1);
}

async function renderHomeSections() {
    const sections = [
        { title: "Phim Hàn Quốc", url: `${API_BASE}/v1/api/quoc-gia/han-quoc`, slug: "quoc-gia/han-quoc" },
        { title: "Anime", url: `${API_BASE}/v1/api/danh-sach/hoat-hinh`, slug: "danh-sach/hoat-hinh" },
        { title: "Phim Chiếu Rạp", url: `${API_BASE}/v1/api/danh-sach/phim-chieu-rap`, slug: "danh-sach/phim-chieu-rap" },
        { title: "Phim Hành Động", url: `${API_BASE}/v1/api/the-loai/hanh-dong`, slug: "the-loai/hanh-dong" },
        { title: "Phim Tình Cảm", url: `${API_BASE}/v1/api/the-loai/tinh-cam`, slug: "the-loai/tinh-cam" },
        { title: "Phim Tâm Lý", url: `${API_BASE}/v1/api/the-loai/tam-ly`, slug: "the-loai/tam-ly" },
        { title: "Phim Chính Kịch", url: `${API_BASE}/v1/api/the-loai/chinh-kich`, slug: "the-loai/chinh-kich" },
        { title: "Phim Kinh Dị", url: `${API_BASE}/v1/api/the-loai/kinh-di`, slug: "the-loai/kinh-di" }
    ];

    const container = document.getElementById('movieContent');

    // Tải toàn bộ section song song nhưng render theo thứ tự cố định
    const promises = sections.map(async (sec) => {
        try {
            const data = await fetchAPI(sec.url + "?page=1");
            let movies = data.data.items || [];
            if (sec.title === "Anime") {
                movies = movies.filter(m => {
                    const country = m.country || [];
                    return country.some(c => c.name === "Nhật Bản" || c.slug === "nhat-ban");
                });
            }
            return { movies, sec };
        } catch (e) {
            return { movies: [], sec };
        }
    });

    const results = await Promise.all(promises);
    results.forEach(res => {
        if (res.movies.length > 0) {
            sortMoviesNewest(res.movies);
            renderSingleSection(container, res.sec.title, res.movies, res.sec.slug);
        }
    });
}

function renderSingleSection(parent, title, movies, slug) {
    // Tạo link cho nút Xem Thêm
    let filterUrl = "index.html";
    const parts = slug.split('/');
    if (parts.length >= 2) {
        const type = parts[0]; // quoc-gia, the-loai, danh-sach
        const key = type === 'quoc-gia' ? 'country' : (type === 'the-loai' ? 'category' : 'list');
        const val = parts[1];
        filterUrl = `index.html?type=filter&${key}=${val}&${key}Name=${encodeURIComponent(title)}`;
    }

    const secDiv = document.createElement('div');
    secDiv.className = 'movie-section-block';
    secDiv.innerHTML = `
        <div class="section-header">
            <h2>${title}</h2>
            <a href="${filterUrl}" class="see-more-link">Xem Thêm <i class="fa-solid fa-chevron-right"></i></a>
        </div>
        <div class="movie-slider-wrapper">
            <button class="slider-btn prev"><i class="fa-solid fa-chevron-left"></i></button>
            <div class="movie-grid" data-slug="${slug}" data-page="1" data-hasmore="true" data-title="${title}">
                <div class="row-sentinel" style="width: 50px; flex-shrink: 0;"></div>
            </div>
            <button class="slider-btn next"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
    `;
    parent.appendChild(secDiv);
    const grid = secDiv.querySelector('.movie-grid');
    const sentinel = secDiv.querySelector('.row-sentinel');

    renderMoviesToGrid(grid, movies);

    const rowObserver = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && grid.dataset.hasmore === "true" && !grid.dataset.loading) {
            console.log(`Loading more for section: ${title}`);
            await fetchMoreRowData(grid);
        }
    }, { root: grid, threshold: 0.1 });

    if (sentinel) rowObserver.observe(sentinel);
}

async function fetchMoreRowData(grid) {
    grid.dataset.loading = "true";
    const slug = grid.dataset.slug;
    const nextPage = parseInt(grid.dataset.page) + 1;
    const title = grid.dataset.title;

    try {
        const res = await fetch(`${API_BASE}/v1/api/${slug}?page=${nextPage}`);
        const data = await res.json();
        let movies = data.data.items || [];

        if (title === "Anime") {
            movies = movies.filter(m => (m.country || []).some(c => c.slug === "nhat-ban"));
        }

        if (movies.length === 0) {
            grid.dataset.hasmore = "false";
        } else {
            sortMoviesNewest(movies);
            renderMoviesToGrid(grid, movies);
            grid.dataset.page = nextPage;
        }
    } catch (e) { } finally {
        delete grid.dataset.loading;
    }
}

function renderMoviesToGrid(targetGrid, items) {
    const isMobile = window.innerWidth <= 600;
    const priorityLimit = isMobile ? 2 : 6;
    const sentinel = targetGrid.querySelector('.row-sentinel, #scrollSentinel');

    items.forEach((movie, index) => {
        // --- BỘ LỌC 18+ ---
        const cats = movie.category || [];
        const isAdult = cats.some(c => c.name === "Phim 18+" || c.slug === "phim-18");
        if (isAdult) return;

        let poster = getImgUrl(movie.poster_url);

        const priorityAttr = index < priorityLimit ? 'fetchpriority="high"' : 'loading="lazy"';
        const card = document.createElement("div");
        card.className = "movie-card";

        let rating = (movie.tmdb && movie.tmdb.vote_average) ? movie.tmdb.vote_average.toFixed(1) : (Math.random() * 1.5 + 7.5).toFixed(1);
        const quality = movie.quality ? movie.quality.toUpperCase().replace('FULL ', '') : 'HD';
        const epStatus = movie.episode_current || 'Full';

        card.innerHTML = `
            <div class="poster-wrapper">
                <div class="movie-rating"><i class="fa-solid fa-star"></i><span>${rating}</span></div>
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
            // Nếu load trực tiếp tạch, thử qua Proxy trước khi buông xuôi dùng Default
            if (img.src !== DEFAULT_POSTER && !img.dataset.proxied) {
                console.warn("Thử load ảnh qua Proxy...");
                img.dataset.proxied = "true";
                img.src = `/api/proxy?url=${encodeURIComponent(poster)}`;
            } else {
                img.src = DEFAULT_POSTER;
            }
        });

        card.onclick = () => window.location.assign(`player.html?slug=${movie.slug}`);

        if (sentinel) {
            targetGrid.insertBefore(card, sentinel);
        } else {
            targetGrid.appendChild(card);
        }
    });

    // Cập nhật mũi tên ngay sau khi render
    setTimeout(() => {
        const updateSliderArrows = (grid) => {
            const wrapper = grid.closest('.movie-slider-wrapper');
            const sliderPrev = wrapper.querySelector('.slider-btn.prev');
            const sliderNext = wrapper.querySelector('.slider-btn.next');
            const scrollLeft = grid.scrollLeft;
            const maxScroll = grid.scrollWidth - grid.clientWidth;
            if (sliderPrev) {
                if (scrollLeft > 20) sliderPrev.classList.add('visible');
                else sliderPrev.classList.remove('visible');
            }
            if (sliderNext) {
                if (scrollLeft < maxScroll - 20) sliderNext.classList.add('visible');
                else sliderNext.classList.remove('visible');
            }
        };
        updateSliderArrows(targetGrid);
    }, 200);
}



function renderMovies(items, isFirstPage = true) {
    const temp = document.getElementById('tempSkeletons');
    if (temp) temp.remove();

    if (isFirstPage) {
        movieGrid.innerHTML = "";
    }

    if (!items || items.length === 0) {
        if (isFirstPage) {
            movieGrid.innerHTML = "<p style='text-align: center; color: var(--text-dim); padding: 2rem;'>Không tìm thấy phim nào phù hợp.</p>";
        }
        return;
    }

    const isMobile = window.innerWidth <= 600;
    const priorityLimit = isMobile ? 2 : 6;

    items.forEach((movie, index) => {
        // --- BỘ LỌC 18+ (TUYÊN NGÔN: Chỉ ẩn ở ngoài, tìm kiếm vẫn ra) ---
        const cats = movie.category || [];
        const isAdult = cats.some(c => c.name === "Phim 18+" || c.slug === "phim-18");
        if (isAdult && state.type !== 'search') return;

        let poster = DEFAULT_POSTER;
        if (movie.poster_url) {
            poster = movie.poster_url.startsWith('http') ? movie.poster_url : `${IMG_BASE}${movie.poster_url}`;
        } else if (movie.thumb_url) {
            poster = movie.thumb_url.startsWith('http') ? movie.thumb_url : `${IMG_BASE}${movie.thumb_url}`;
        } else if (movie.poster) {
            poster = movie.poster.startsWith('http') ? movie.poster : `${IMG_BASE}${movie.poster}`;
        }

        // Ưu tiên nạp cao cho các ảnh đầu (để user thấy ngay), còn lại lazy load
        const priorityAttr = index < priorityLimit ? 'fetchpriority="high"' : 'loading="lazy"';

        const card = document.createElement("div");
        card.className = "movie-card";

        let rating = "";
        if (movie.tmdb && movie.tmdb.vote_average) {
            rating = movie.tmdb.vote_average.toFixed(1);
        } else {
            rating = (Math.random() * (9.2 - 7.5) + 7.5).toFixed(1);
        }

        const quality = movie.quality ? movie.quality.toUpperCase().replace('FULL ', '') : 'HD';
        const epStatus = movie.episode_current || 'Full';

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
                <div class="meta">${movie.origin_name || (movie.epName ? `Đang xem: Tập ${movie.epName}` : '')}</div>
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

        // Luôn chèn trước sentinel nếu sentinel có trong movieGrid
        if (scrollSentinel && movieGrid.contains(scrollSentinel)) {
            movieGrid.insertBefore(card, scrollSentinel);
        } else {
            movieGrid.appendChild(card);
        }
    });

    // Đảm bảo sentinel luôn ở cuối cùng
    if (scrollSentinel) {
        movieGrid.appendChild(scrollSentinel);
    }

    // Cập nhật mũi tên sau khi render
    setTimeout(() => {
        const updateSliderArrows = () => {
            const scrollLeft = movieGrid.scrollLeft;
            const maxScroll = movieGrid.scrollWidth - movieGrid.clientWidth;
            const sliderPrev = document.getElementById('sliderPrev');
            const sliderNext = document.getElementById('sliderNext');

            if (sliderPrev) {
                if (scrollLeft > 20) sliderPrev.classList.add('visible');
                else sliderPrev.classList.remove('visible');
            }
            if (sliderNext) {
                if (scrollLeft < maxScroll - 20) sliderNext.classList.add('visible');
                else sliderNext.classList.remove('visible');
            }
        };
        updateSliderArrows();
    }, 100);
}


function showLoader(show) {
    const loaderEl = document.getElementById('loader');
    if (loaderEl) {
        loaderEl.className = show ? "loader active" : "loader";
    }
}

// --- Skeleton Loading (Chuẩn OPhim Core) ---
function showSkeletons(show) {
    if (!show) return;

    // Tính toán số lượng card khớp với màn hình hiện tại
    const containerWidth = movieGrid.clientWidth || (window.innerWidth * 0.9);
    // Độ rộng ước tính của 1 card (200px) + gap (1.2rem ~ 20px) = 220px
    const itemsPerRow = Math.max(2, Math.floor(containerWidth / 220));

    // Trang 1 hiện ít nhất 2 hàng, cuộn tiếp hiện ít nhất 1 hàng
    const count = state.page === 1 ? (itemsPerRow * 2) : itemsPerRow;

    const skeletonHTML = Array(count).fill('<div class="skeleton-card"></div>').join('');

    if (state.page === 1) {
        movieGrid.innerHTML = skeletonHTML;
    } else {
        const div = document.createElement('div');
        div.id = 'tempSkeletons';
        div.style.display = 'contents';
        div.innerHTML = skeletonHTML;

        // Luôn chèn trước sentinel nếu có
        if (scrollSentinel && movieGrid.contains(scrollSentinel)) {
            movieGrid.insertBefore(div, scrollSentinel);
        } else {
            movieGrid.appendChild(div);
        }
    }
}

function renderWatchHistory() {
    const recentSection = document.getElementById('recentSection');
    const recentGrid = document.getElementById('recentGrid');
    const history = JSON.parse(localStorage.getItem('watchHistory') || "[]");

    // Chỉ hiện Lịch sử xem ở trang chủ và nếu có dữ liệu
    if (history.length === 0 || state.type !== 'home') {
        recentSection.style.display = 'none';
        return;
    }

    recentSection.style.display = 'block';
    recentGrid.innerHTML = "";

    // Hiện nút 'Xem Thêm' cho lịch sử
    if (recentSeeMore) {
        recentSeeMore.style.display = history.length > 4 ? "flex" : "none";
        recentSeeMore.href = "index.html?type=history";
    }

    history.forEach(item => {
        const percent = Math.min(100, Math.floor((item.time / item.duration) * 100)) || 0;
        const posterUrl = getImgUrl(item.poster);

        const card = document.createElement('div');
        card.className = "recent-card";
        card.innerHTML = `
            <div class="recent-poster-wrapper">
                <img src="${posterUrl}" alt="${item.name}" fetchpriority="high" decoding="async">
                <div class="recent-label">Tập ${item.epName || (item.epIndex + 1)}</div>
                <div class="recent-progress-container">
                    <div class="recent-progress-fill" style="width: ${percent}%"></div>
                </div>
            </div>
            <div class="recent-info">
                <div class="recent-title">${item.name}</div>
            </div>
        `;

        // Gắn sự kiện CSP-compliant cho ảnh lịch sử
        const img = card.querySelector('img');
        img.addEventListener('load', () => img.classList.add('loaded'));
        img.addEventListener('error', () => {
            img.onerror = null;
            img.src = DEFAULT_POSTER;
        });

        card.onclick = () => {
            window.location.assign(`player.html?slug=${item.slug}&ep=${item.epIndex}&t=${item.time}`);
        };

        // --- Logic Context Menu cho Lịch sử ---
        let touchTimer = null;
        const handleLongPress = (x, y) => {
            showContextMenu(x, y, item.slug);
        };

        card.oncontextmenu = (e) => {
            e.preventDefault();
            showContextMenu(e.pageX, e.pageY, item.slug);
        };

        // Hỗ trợ Touch cho Mobile
        card.addEventListener('touchstart', (e) => {
            touchTimer = setTimeout(() => {
                const touch = e.touches[0];
                handleLongPress(touch.pageX, touch.pageY);
                touchTimer = null;
            }, 400);
        }, { passive: true });

        card.addEventListener('touchend', () => {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        });

        card.addEventListener('touchmove', () => {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        });

        recentGrid.appendChild(card);
    });
}

// Xử lý Context Menu Lịch sử
let currentSlugForCtx = null;
const ctxMenu = document.getElementById('ctxMenu');
const ctxBackdrop = document.getElementById('ctxBackdrop');

function showContextMenu(x, y, slug) {
    if (!ctxMenu || !ctxBackdrop) return;
    currentSlugForCtx = slug;
    ctxMenu.style.display = 'block';
    ctxBackdrop.style.display = 'block';

    // Đảm bảo menu không bị tràn khỏi màn hình
    const menuWidth = ctxMenu.offsetWidth || 180;
    const menuHeight = ctxMenu.offsetHeight || 100;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    let posX = x;
    let posY = y;

    if (x + menuWidth > winWidth) posX = winWidth - menuWidth - 10;
    if (y + menuHeight > winHeight) posY = winHeight - menuHeight - 10;

    ctxMenu.style.left = `${posX}px`;
    ctxMenu.style.top = `${posY}px`;
}

function hideContextMenu() {
    if (ctxMenu) ctxMenu.style.display = 'none';
    if (ctxBackdrop) ctxBackdrop.style.display = 'none';
    currentSlugForCtx = null;
}

if (ctxBackdrop) ctxBackdrop.onclick = hideContextMenu;

document.getElementById('ctxDeleteOne')?.addEventListener('click', () => {
    if (!currentSlugForCtx) return;
    let history = JSON.parse(localStorage.getItem('watchHistory') || "[]");
    history = history.filter(h => h.slug !== currentSlugForCtx);
    localStorage.setItem('watchHistory', JSON.stringify(history));
    hideContextMenu();
    renderWatchHistory();
    updateGist(); // Sync lên mây
});

document.getElementById('ctxDeleteAll')?.addEventListener('click', () => {
    localStorage.removeItem('watchHistory');
    hideContextMenu();
    renderWatchHistory();
    updateGist(); // Sync lên mây
});


// --- Anti-DevTools (Security Shield) ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) e.preventDefault();
});
