const API_BASE = "https://ophim1.com";
const IMG_BASE = "https://img.ophim1.com/uploads/movies/";
const movieGrid = document.getElementById("movieGrid");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("searchInput");
const searchInfo = document.getElementById("searchInfo");
const sectionHeader = document.querySelector(".section-header");
const listTitle = document.getElementById("list-title");

// Cấu hình lọc
const filters = [
    { id: 'selectCategory', type: 'the-loai', label: 'Thể loại' },
    { id: 'selectCountry', type: 'quoc-gia', label: 'Quốc gia' },
    { id: 'selectYear', type: 'nam-phat-hanh', label: 'Năm' }
];


document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    // Nút điều khiển filter tổng
    const filterBar = document.getElementById('filterBar');
    const filterBtn = document.getElementById('filterToggle');

    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isClosing = filterBar.classList.contains('expanded');
        filterBar.classList.toggle('expanded');
        
        if (isClosing) {
            // Khi đóng bảng lọc chính, dọn sạch mọi dropdown con đang mở
            document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
        }
    });

    // Nếu đang mở mà có di chuyển chuột, cũng coi như đang "làm gì đó"

    initFilters();
    renderWatchHistory();

    const type = params.get('type');

    function handleUrlParams() {
        const p = new URLSearchParams(window.location.search);
        const q = p.get('q');
        const t = p.get('type');

        // Reset trạng thái trước khi nạp mới
        state.type = 'home';
        state.query = '';
        state.slug = '';
        state.name = '';
        searchInput.value = '';
        if (searchInput.parentElement) {
            searchInput.parentElement.classList.toggle('active', !!q);
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
            searchInput.value = q;
            loadContent(1);
        } else if (t === 'filter') {
            state.type = 'filter';
            state.query = p.get('subtype');
            state.slug = p.get('slug');
            state.name = p.get('name');
            loadContent(1);

            // Cập nhật UI cho filter đang chọn
            const filterConfig = filters.find(f => f.type === state.query);
            if (filterConfig) {
                const container = document.getElementById(filterConfig.id);
                if (container) {
                    const triggerText = container.querySelector('.select-trigger span');
                    if (triggerText) triggerText.innerText = state.name;
                    container.classList.add('has-selection');
                }
            }
        } else {
            state.type = 'home';
            loadContent(1);
        }
    }

    // Xử lý nạp lần đầu & Back/Forward
    handleUrlParams();
    window.addEventListener('popstate', handleUrlParams);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== "") {
            const q = searchInput.value.trim();
            const queryUrl = `index.html?q=${encodeURIComponent(q)}`;
            // Cập nhật URL và nạp kết quả ngay không reload
            history.pushState({}, '', queryUrl);
            handleUrlParams();
        }
    });

    // Đóng dropdown khi click ra ngoài
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
        }
    });
});

async function initFilters() {
    try {
        const [cats, counts, years] = await Promise.all([
            fetch(`${API_BASE}/v1/api/the-loai`).then(r => r.json()),
            fetch(`${API_BASE}/v1/api/quoc-gia`).then(r => r.json()),
            fetch(`${API_BASE}/v1/api/nam-phat-hanh`).then(r => r.json())
        ]);

        // Thể loại và Quốc gia: Cứu hộ dữ liệu linh hoạt (items hoặc trực tiếp data)
        const getItems = (obj) => {
            if (!obj || !obj.data) return [];
            return Array.isArray(obj.data) ? obj.data : (obj.data.items || []);
        };

        buildCustomDropdown('selectCategory', getItems(cats), 'the-loai', 'Thể loại');
        buildCustomDropdown('selectCountry', getItems(counts), 'quoc-gia', 'Quốc gia');

        // Năm phát hành: Xử lý tương tự để đảm bảo luôn là mảng
        const yearsList = getItems(years);
        const mappedYears = yearsList.map(y => {
            // Lấy giá trị năm: ưu tiên name, slug, hoặc chính nó nếu là string/number
            let val = "";
            if (typeof y === 'object' && y !== null) {
                val = y.name || y.slug || Object.values(y).find(v => typeof v === 'string' || typeof v === 'number');
            } else {
                val = y;
            }
            return {
                name: val || "2024",
                slug: val || "2024"
            };
        });

        buildCustomDropdown('selectYear', mappedYears, 'nam-phat-hanh', 'Năm');

    } catch (e) {
        console.error("Filter Init Error:", e);
    }
}


function buildCustomDropdown(containerId, items, type, defaultLabel) {
    const container = document.getElementById(containerId);
    const trigger = container.querySelector('.select-trigger');
    const optionsBox = container.querySelector('.options-container');
    const triggerText = trigger.querySelector('span');

    // Toggle dropdown (Split logic)
    trigger.onclick = (e) => {
        e.stopPropagation();

        // Kiểm tra xem người dùng click vào phần chữ (span) hay phần mũi tên/nền
        if (e.target.tagName === 'SPAN') {
            // Nhấn vào chữ: Xóa lựa chọn, quay lại trạng thái mặc định
            if (container.classList.contains('has-selection')) {
                triggerText.innerText = defaultLabel;
                container.classList.remove('active');
                container.classList.remove('has-selection');

                // --- TRANG CHỦ: Quay về vạch xuất phát ---
                state.type = 'home';
                state.query = '';
                state.slug = '';
                state.name = '';
                history.pushState({}, '', 'index.html');
                loadContent(1);
                return; // Kết thúc sớm, không mở menu
            }
        }

        // Nhấn vào vùng khác (mũi tên/nền): Đóng/mở menu như cũ
        const isActive = container.classList.contains('active');
        document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
        if (!isActive) {
            container.classList.add('active');
        }
    };

    // Thêm option mặc định (Luôn là "Tất cả" để Reset)
    const defaultOpt = document.createElement('div');
    defaultOpt.className = 'option';
    defaultOpt.innerText = "Tất cả";
    defaultOpt.onclick = () => {
        triggerText.innerText = defaultLabel;
        container.classList.remove('active');
        container.classList.remove('has-selection');

        state.type = 'home';
        state.query = '';
        state.slug = '';
        state.name = '';
        state.page = 1;

        history.pushState({}, '', 'index.html');
        loadContent(1);
    };
    optionsBox.appendChild(defaultOpt);

    // Thêm các option từ API
    items.forEach(item => {
        const opt = document.createElement('div');
        opt.className = 'option';
        opt.innerText = item.name;
        opt.onclick = () => {
            // Reset các dropdown khác về mặc định
            filters.forEach(f => {
                if (f.id !== containerId) {
                    const otherTriggerText = document.querySelector(`#${f.id} .select-trigger span`);
                    if (otherTriggerText) otherTriggerText.innerText = f.label;
                    const otherContainer = document.getElementById(f.id);
                    if (otherContainer) otherContainer.classList.remove('has-selection');
                }
            });

            triggerText.innerText = item.name;
            container.classList.remove('active');
            container.classList.add('has-selection');

            // Cập nhật trạng thái ứng dụng và tải phim theo bộ lọc
            state.type = 'filter';
            state.query = type;
            state.slug = item.slug;
            state.name = item.name;

            // Cập nhật URL (không reload) để hỗ trợ nút Quay lại
            const filterUrl = `index.html?type=filter&subtype=${type}&slug=${item.slug}&name=${encodeURIComponent(item.name)}`;
            history.pushState({}, '', filterUrl);

            loadContent(1);
            resetFilterTimer();
        };
        optionsBox.appendChild(opt);
    });
}

// --- Hệ thống Cache & Pre-fetching (Chuẩn OPhim Core) ---
const apiCache = new Map();
let isFetching = false;
let hasMore = true;

const state = {
    type: 'home',
    query: '',
    slug: '',
    name: '',
    page: 1
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

    state.page = page;

    // Tạo khóa Cache dựa trên URL
    const isHome = state.type === 'home';
    let url = "";
    if (isHome) url = `${API_BASE}/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`;
    else if (state.type === 'search') url = `${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(state.query)}&page=${page}`;
    else if (state.type === 'filter') url = `${API_BASE}/v1/api/${state.query}/${state.slug}?page=${page}`;

    // KIỂM TRA CACHE: Nếu đã có dữ liệu, hiện ngay không chờ đợi
    if (apiCache.has(url)) {
        const cachedData = apiCache.get(url);
        processMovieData(cachedData, page);
        return;
    }

    isFetching = true;
    if (page === 1) {
        movieGrid.innerHTML = "";
        hasMore = true;
    }

    // UI Updates
    const recentSection = document.getElementById('recentSection');
    const listTitle = document.getElementById('list-title');
    if (sectionHeader) sectionHeader.style.display = 'block';
    if (listTitle) {
        if (state.type === 'home') listTitle.innerText = 'Phim Mới Cập Nhật';
        else if (state.type === 'search') listTitle.innerText = 'Kết quả tìm kiếm';
        else if (state.type === 'filter') listTitle.innerText = state.name || 'Kết quả lọc';
    }
    if (recentSection) {
        const hasHistory = JSON.parse(localStorage.getItem('watchHistory') || "[]").length > 0;
        recentSection.style.display = (isHome && hasHistory) ? 'block' : 'none';
    }

    if (searchInfo && page === 1) {
        searchInfo.classList.remove('active');
    }

    showLoader(true);
    showSkeletons(true);

    try {
        const res = await fetch(url);
        const data = await res.json();

        // LƯU CACHE
        apiCache.set(url, data);

        processMovieData(data, page);

        // THÔNG MINH: Nạp trước (Pre-fetch) trang tiếp theo sau 2 giây nhàn rỗi
        if (hasMore) {
            setTimeout(() => prefetchNextPage(page + 1), 2000);
        }
    } catch (e) {
        console.error("Load Content Error:", e);
    } finally {
        isFetching = false;
        showLoader(false);
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

function processMovieData(data, page) {
    let items = data.data.items || [];
    const paging = data.data.params.pagination;

    // --- Logic Sắp xếp: Phim mới nhất lên đầu ---
    items.sort((a, b) => {
        // 1. So sánh theo Năm phát hành (Giảm dần)
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearB !== yearA) return yearB - yearA;

        // 2. Nếu cùng năm, so sánh theo thời gian cập nhật (Giảm dần)
        const timeA = a.modified && a.modified.time ? new Date(a.modified.time).getTime() : 0;
        const timeB = b.modified && b.modified.time ? new Date(b.modified.time).getTime() : 0;
        return timeB - timeA;
    });

    if (items.length === 0 || page >= paging.totalPages || items.length < 24) {
        hasMore = false;
    }

    if (state.type === 'search' && page === 1) {
        searchInfo.classList.add('active');
        searchInfo.innerHTML = `Tìm thấy <strong>${paging.totalItems}</strong> kết quả cho: "<strong>${state.query}</strong>"`;
    }

    renderMovies(items, page === 1);
}

// Ảnh mặc định (Base64 SVG) để dùng khi không tải được ảnh từ server
const DEFAULT_POSTER = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'200' height%3D'300' viewBox%3D'0 0 200 300'%3E%3Crect width%3D'200' height%3D'300' fill%3D'%23252830'%2F%3E%3Ctext x%3D'50%25' y%3D'50%25' dominant-baseline%3D'middle' text-anchor%3D'middle' font-family%3D'sans-serif' font-size%3D'14' fill%3D'%23555'%3EImage Error%3C%2Ftext%3E%3C%2Fsvg%3E";

function renderMovies(items, isFirstPage = true) {
    // Dọn dẹp skeleton nếu có
    const temp = document.getElementById('tempSkeletons');
    if (temp) temp.remove();

    if (isFirstPage) {
        movieGrid.innerHTML = "";
    }

    // Giới hạn hiển thị tối đa 24 phim mỗi đợt nạp
    const displayItems = items.slice(0, 24);

    if (!displayItems || displayItems.length === 0) {
        if (isFirstPage) {
            movieGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-dim)'>Không tìm thấy phim nào phù hợp.</p>";
        }
        return;
    }

    displayItems.forEach((movie, index) => {
        let poster = DEFAULT_POSTER;
        if (movie.poster_url) {
            poster = movie.poster_url.startsWith('http') ? movie.poster_url : `${IMG_BASE}${movie.poster_url}`;
        } else if (movie.thumb_url) {
            poster = movie.thumb_url.startsWith('http') ? movie.thumb_url : `${IMG_BASE}${movie.thumb_url}`;
        }

        // Ưu tiên nạp cao cho 6 phim đầu tiên (hàng đầu hiển thị)
        const priorityAttr = index < 6 ? 'fetchpriority="high"' : 'loading="lazy"';

        const card = document.createElement("div");
        card.className = "movie-card";

        // Logic xử lý điểm đánh giá (Thực tế + Giả lập thông minh)
        let rating = "";
        if (movie.tmdb && movie.tmdb.vote_average) {
            rating = movie.tmdb.vote_average.toFixed(1);
        } else {
            // Giả lập điểm từ 7.5 - 9.2 để giao diện đẹp
            rating = (Math.random() * (9.2 - 7.5) + 7.5).toFixed(1);
        }

        const quality = movie.quality ? movie.quality.toUpperCase().replace('FULL ', '') : 'HD';
        const epStatus = movie.episode_current || 'Full';

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

        // Gắn sự kiện CSP-compliant bằng JS thay vì viết trực tiếp vào thẻ img
        const img = card.querySelector('.poster');
        img.addEventListener('load', () => img.classList.add('loaded'));
        img.addEventListener('error', () => {
            img.onerror = null;
            img.src = DEFAULT_POSTER;
        });

        // Chuyển hướng sang trang player kèm theo slug
        card.onclick = () => {
            const watchUrl = `player.html?slug=${movie.slug}`;
            window.location.assign(watchUrl);
        };
        movieGrid.appendChild(card);
    });
}


function showLoader(show) {
    loader.className = show ? "loader active" : "loader";
}

// --- Skeleton Loading (Chuẩn OPhim Core) ---
function showSkeletons(show) {
    if (!show) return;

    // Nếu là trang đầu, hiện 12 skeleton, nếu là cuộn tiếp hiện 4 cái
    const count = state.page === 1 ? 12 : 4;
    const skeletonHTML = Array(count).fill('<div class="skeleton-card"></div>').join('');

    if (state.page === 1) {
        movieGrid.innerHTML = skeletonHTML;
    } else {
        // Nối thêm vào cuối khi cuộn
        const div = document.createElement('div');
        div.id = 'tempSkeletons';
        div.style.display = 'contents';
        div.innerHTML = skeletonHTML;
        movieGrid.appendChild(div);
    }
}

function renderWatchHistory() {
    const recentSection = document.getElementById('recentSection');
    const recentGrid = document.getElementById('recentGrid');
    const history = JSON.parse(localStorage.getItem('watchHistory') || "[]");

    if (history.length === 0) {
        recentSection.style.display = 'none';
        return;
    }

    recentSection.style.display = 'block';
    recentGrid.innerHTML = "";

    history.forEach(item => {
        const percent = Math.min(100, Math.floor((item.time / item.duration) * 100)) || 0;
        const posterUrl = item.poster.startsWith('http') ? item.poster : `${IMG_BASE}${item.poster}`;

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

        recentGrid.appendChild(card);
    });
}

\n
// --- Anti-DevTools ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) e.preventDefault();
});
