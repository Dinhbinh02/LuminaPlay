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

function handleUrlParams() {
    const p = new URLSearchParams(window.location.search);
    const q = p.get('q');
    const t = p.get('type');

    // Reset trạng thái trước khi nạp mới
    state.type = 'home';
    state.query = '';
    state.category = { slugs: '', names: '' };
    state.country = { slugs: '', names: '' };
    state.year = { slugs: '', names: '' };
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
    } else if (t === 'filter') {
        state.type = 'filter';
        state.category.slugs = p.get('category') || '';
        state.category.names = p.get('catName') || '';
        state.country.slugs = p.get('country') || '';
        state.country.names = p.get('countryName') || '';
        state.year.slugs = p.get('year') || '';
        state.year.names = p.get('yearName') || '';
        
        // Cập nhật Tiêu đề ngay lập tức để tránh bị nháy chữ cũ
        let titleParts = [];
        if (state.category.names) titleParts.push(state.category.names);
        if (state.country.names) titleParts.push(state.country.names);
        if (state.year.names) titleParts.push(`Năm ${state.year.names}`);
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
        loadContent(1);
    }
    renderWatchHistory();

    // Auto scroll tới section thứ 2 khi tìm kiếm hoặc lọc
    if (state.type !== 'home') {
        const titleEl = document.getElementById('list-title');
        if (titleEl) {
            setTimeout(() => {
                const header = document.getElementById('filterBar');
                const hHeight = header ? header.offsetHeight : 80;
                const gap = 10;
                const y = (titleEl.getBoundingClientRect().top + window.pageYOffset) - hHeight - gap;
                window.scrollTo({ top: y, behavior: 'auto' }); // Cuộn ngay lập tức (không smooth)
            }, 0); 
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const type = params.get('type');

    // Nút điều khiển filter tổng
    const filterBar = document.getElementById('filterBar');
    const filterBtn = document.getElementById('filterToggle');

    // Tự động mở filterBar nếu đang ở chế độ filter (nhấn từ thẻ tag sang chẳng hạn)
    if (type === 'filter') {
        filterBar.classList.add('expanded');
    }

    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isClosing = filterBar.classList.contains('expanded');
        filterBar.classList.toggle('expanded');
        
        if (isClosing) {
            // Khi đóng bảng lọc chính, dọn sạch mọi dropdown con đang mở & Xóa hết lựa chọn
            filters.forEach(f => {
                const container = document.getElementById(f.id);
                if (container) {
                    container.selectedItems = [];
                    container.classList.remove('has-selection', 'active');
                    container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                    const triggerText = container.querySelector('.select-trigger span');
                    if (triggerText) triggerText.innerText = f.label;
                }
            });
            applyMultiFilter();
        }
    });

    // Nếu đang mở mà có di chuyển chuột, cũng coi như đang "làm gì đó"

    initFilters();
    renderWatchHistory();

    // Xử lý nạp lần đầu & Back/Forward
    handleUrlParams();
    window.addEventListener('popstate', handleUrlParams);

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
            fetch(`${API_BASE}/v1/api/the-loai`).then(r => r.json()),
            fetch(`${API_BASE}/v1/api/quoc-gia`).then(r => r.json()),
            fetch(`${API_BASE}/v1/api/nam-phat-hanh`).then(r => r.json())
        ]);

        // Thể loại và Quốc gia: Cứu hộ dữ liệu linh hoạt (items hoặc trực tiếp data)
        const getItems = (obj) => {
            if (!obj || !obj.data) return [];
            return Array.isArray(obj.data) ? obj.data : (obj.data.items || []);
        };

        // --- THEO Ý TÔI: Thêm Phim Bộ (Phim lẻ API) và Phim Lẻ (Phim bộ API) vào đầu danh sách ---
        const rawCats = getItems(cats).filter(c => c.name !== "Phim 18+");
        const specialTypes = [
            { name: "Phim Bộ", slug: "phim-le", customType: "danh-sach" }, // User: Bộ = 1 tập
            { name: "Phim Lẻ", slug: "phim-bo", customType: "danh-sach" }  // User: Lẻ = >1 tập
        ];
        const combinedCats = [...specialTypes, ...rawCats];

        buildCustomDropdown('selectCategory', combinedCats, 'the-loai', 'Thể loại');
        buildCustomDropdown('selectCountry', getItems(counts), 'quoc-gia', 'Quốc gia');

        // Năm phát hành: Xử lý deduplicate và sắp xếp giảm dần
        const yearsList = getItems(years);
        const uniqueYears = new Set();
        yearsList.forEach(y => {
            let val = "";
            if (typeof y === 'object' && y !== null) {
                // API trả về { year: 2026 } hoặc có thể trả { name: "2026" } tùy phiên bản
                val = y.year || y.name || y.slug;
            } else { val = y; }
            if (val) uniqueYears.add(String(val).trim());
        });

        const mappedYears = Array.from(uniqueYears)
            .filter(y => y.length > 0)
            .sort((a, b) => parseInt(b) - parseInt(a)) // Ép kiểu số để so sánh chính xác
            .map(y => ({ name: y, slug: y }));

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

    // BẢO TỒN DỮ LIỆU: Nếu handleUrlParams đã load trước và có giá trị, thì giữ lại
    container.selectedItems = container.selectedItems || [];

    trigger.onclick = (e) => {
        e.stopPropagation();

        // Đóng các dropdown khác, chỉ mở mình tôi
        const isActive = container.classList.contains('active');
        let otherChanged = false;
        document.querySelectorAll('.custom-select.active').forEach(s => {
            if (s !== container) {
                s.classList.remove('active');
                otherChanged = true;
            }
        });
        
        if (otherChanged) applyMultiFilter();

        container.classList.toggle('active');
        
        // Nếu vừa ĐÓNG dropdown xong, tiến hành apply bộ lọc nếu có thay đổi
        if (isActive) {
             applyMultiFilter();
        }
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
        applyMultiFilter();
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

function applyMultiFilter(excludeId = null) {
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

    if (p.toString() === "type=filter") {
        history.pushState({}, '', 'index.html');
    } else {
        history.pushState({}, '', `index.html?${p.toString()}`);
    }
    handleUrlParams();
}

// Bổ sung sự kiện đóng dropdown khi click/chạm ra ngoài và apply filter
const closeAndApply = (e) => {
    let changed = false;
    document.querySelectorAll('.custom-select.active').forEach(container => {
        if (!container.contains(e.target)) {
            container.classList.remove('active');
            changed = true;
        }
    });
    if (changed) applyMultiFilter();
};
window.addEventListener('click', closeAndApply);
window.addEventListener('touchstart', closeAndApply, { passive: true });

// --- Hệ thống Cache & Pre-fetching (Chuẩn OPhim Core) ---
const apiCache = new Map();
let isFetching = false;
let hasMore = true;
let contentAbortController = null;

const state = {
    type: 'home',
    page: 1,
    query: '',
    category: { slugs: '', names: '' },
    country: { slugs: '', names: '' },
    year: { slugs: '', names: '' }
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
    // Cho phép nạp trang mới (page 1) ngay cả khi đang bận, để hủy yêu cầu cũ và nạp cái mới nhất
    if (page > 1 && (isFetching || !hasMore)) return;
    
    // Nếu nạp lại từ đầu (page 1) mà đang có yêu cầu cũ chạy dở, hãy hủy nó
    if (page === 1 && contentAbortController) {
        contentAbortController.abort();
    }
    contentAbortController = new AbortController();
    const signal = contentAbortController.signal;

    state.page = page;

    // Reset kết quả nếu là trang 1
    if (page === 1) {
        movieGrid.innerHTML = "";
        hasMore = true;
    }

    // Xác định bộ URL cần nạp
    let urls = [];
    if (state.type === 'home') {
        urls = [`${API_BASE}/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`];
    } else if (state.type === 'search') {
        urls = [`${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(state.query)}&page=${page}`];
    } else if (state.type === 'filter') {
        const catSlug = state.category.slugs;
        const countrySlug = state.country.slugs;
        const yearSlug = state.year.slugs;

        // Ưu tiên nạp theo thể loại hoặc danh sách mới nhất nếu không có thể loại
        if (catSlug) {
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
                // Mặc dù nếu có catSlug thì đã rơi vào if bên trên, nhưng viết đầy đủ cho an toàn
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
    // showLoader(true); // Gây giật lag layout do loader nằm trên grid
    showSkeletons(true);

    try {
        // TẢI SONG SONG (Promise.all)
        const responses = await Promise.all(urls.map(url => {
             if (apiCache.has(url)) return Promise.resolve(apiCache.get(url));
             return fetch(url, { signal }).then(r => r.json()).then(data => {
                 apiCache.set(url, data);
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

        if (finalItems.length === 0 || totalLimit === responses.length || finalItems.length < 12) {
            hasMore = false;
        }

        if (page === 1) {
            if (state.type === 'home') {
                listTitle.innerText = "Phim Mới Cập Nhật";
            } else if (state.type === 'search') {
                const totalItems = responses[0].data.params.pagination.totalItems;
                listTitle.innerText = `Tìm kiếm: ${state.query}`;
                searchInfo.classList.add('active');
                searchInfo.innerHTML = `Tìm thấy <strong>${totalItems}</strong> kết quả cho: "<strong>${state.query}</strong>"`;
            } else if (state.type === 'filter') {
                let titleParts = [];
                if (state.category.names) titleParts.push(state.category.names);
                if (state.country.names) titleParts.push(state.country.names);
                if (state.year.names) titleParts.push(`Năm ${state.year.names}`);
                listTitle.innerText = titleParts.length > 0 ? titleParts.join(' | ') : "Bộ lọc phim";
                searchInfo.classList.remove('active');
            }
        }

        renderMovies(finalItems, page === 1);

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

    // Luôn hiện Lịch sử xem nếu có dữ liệu, không quan tâm đang search/filter hay không
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
});

document.getElementById('ctxDeleteAll')?.addEventListener('click', () => {
    localStorage.removeItem('watchHistory');
    hideContextMenu();
    renderWatchHistory();
});


// --- Anti-DevTools (Security Shield) ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) e.preventDefault();
});
