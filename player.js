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
    const epIndex = params.get('ep');
    const startTime = params.get('t');

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

        // Nếu không có tham số trên URL, thử lấy từ kho tiến độ (videoProgress)
        if (epIndex === null && startTime === null) {
            const progress = JSON.parse(localStorage.getItem('videoProgress') || "{}");
            if (progress[slug]) {
                finalEp = progress[slug].epIndex;
                finalTime = progress[slug].time;
            }
        }

        playMovie(slug, parseInt(finalEp || 0), parseFloat(finalTime || 0));
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

        // Metadata badges
        const metaRow = document.getElementById("current-meta");
        if (metaRow) {
            metaRow.style.display = "flex";
            document.getElementById("meta-year").innerText = currentMovie.year || "";
            document.getElementById("meta-quality").innerText = (currentMovie.quality || "HD").toUpperCase();
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
    
    // 1. Lưu vào Danh sách hiển thị (Watch History)
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
    if (history.length > 20) history.pop();
    localStorage.setItem('watchHistory', JSON.stringify(history));

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

/** 
 * NEW: Fetch cast & people from API
 */
async function fetchCast(slug) {
    const section = document.getElementById('castSection');
    const list = document.getElementById('castList');
    if (!section || !list) return;

    try {
        const res = await fetch(`${API_BASE}/v1/api/phim/${slug}/peoples`);
        const data = await res.json();
        
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

    // Chỉ hiển thị các thể loại chính của phim (do tag TMDB không hiệu quả trong tìm kiếm)
    container.innerHTML = '';
    if (currentMovie && currentMovie.category) {
        currentMovie.category.forEach(cat => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerText = cat.name;
            tag.onclick = () => {
                window.location.assign(`index.html?type=filter&category=${cat.slug}&catName=${encodeURIComponent(cat.name)}`);
            };
            container.appendChild(tag);
        });
    }
}

// --- Anti-DevTools (Security Shield) ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) e.preventDefault();
});
