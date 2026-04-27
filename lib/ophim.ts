const BASE_URL = 'https://ophim1.com';
const API_URL = `${BASE_URL}/v1/api`;

export interface OphimItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  quality?: string;
  lang?: string;
  category?: { id: string; name: string; slug: string }[];
  tmdb?: { vote_average: number; [key: string]: any };
  imdb?: { vote_average: number; [key: string]: any };
  episode_current?: string;
  episode_total?: string;
  status?: string;
}

export interface OphimHomeResponse {
  status: string;
  data: {
    items: OphimItem[];
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface OphimListResponse {
  status: string;
  data: {
    items: OphimItem[];
    APP_DOMAIN_CDN_IMAGE: string;
    titlePage: string;
    params: {
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        pageRanges: number;
      };
    };
  };
}

export const ophim = {
  getHome: async (): Promise<OphimHomeResponse> => {
    const res = await fetch(`${API_URL}/home`, { next: { revalidate: 3600 } });
    return res.json();
  },

  getList: async (category: string, page = 1, limit = 10): Promise<OphimListResponse> => {
    const res = await fetch(`${API_URL}/danh-sach/${category}?page=${page}&limit=${limit}`, { next: { revalidate: 3600 } });
    return res.json();
  },

  getMovieDetail: async (slug: string) => {
    const res = await fetch(`${API_URL}/phim/${slug}`, { next: { revalidate: 3600 } });
    return res.json();
  },

  getImages: async (slug: string) => {
    const res = await fetch(`${API_URL}/phim/${slug}/images`);
    return res.json();
  },

  getCast: async (slug: string) => {
    const res = await fetch(`${API_URL}/phim/${slug}/peoples`);
    return res.json();
  },

  getGenres: async () => {
    const res = await fetch(`${API_URL}/the-loai`);
    return res.json();
  },

  getCountries: async () => {
    const res = await fetch(`${API_URL}/quoc-gia`);
    return res.json();
  },

  search: async (keyword: string, page = 1) => {
    const res = await fetch(`${API_URL}/tim-kiem?keyword=${keyword}&page=${page}`);
    return res.json();
  },

  getMovies: async (type: 'the-loai' | 'quoc-gia' | 'danh-sach', slug: string, params: { page?: number; limit?: number; country?: string; category?: string; year?: string } = {}): Promise<OphimListResponse> => {
    const query = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 24).toString(),
      ...(params.country && { country: params.country }),
      ...(params.category && { category: params.category }),
      ...(params.year && { year: params.year }),
    });
    const res = await fetch(`${API_URL}/${type}/${slug}?${query.toString()}`, { next: { revalidate: 3600 } });
    return res.json();
  },

  getImageUrl: (path: string | undefined, domain: string | undefined = 'https://img.ophim.cc/uploads/movies/') => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    let base = domain;
    if (base.includes('img.ophim.live') && !base.includes('/uploads/movies')) {
      base = `${base}/uploads/movies/`;
    }
    
    const cleanDomain = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    return `${cleanDomain}${cleanPath}`;
  },

  formatEpisode: (ep: string | undefined, total?: string, status?: string) => {
    if (!ep && !status) return '';
    
    const epLower = ep?.toLowerCase() || '';
    const statusLower = status?.toLowerCase() || '';

    // 1. Trailer
    if (statusLower === 'trailer' || epLower === 'trailer') return 'Trailer';
    
    // 2. Full / Completed
    if (statusLower === 'completed' || epLower.includes('full') || epLower.includes('hoàn tất')) {
      return 'Full';
    }

    // 3. Coming Soon (no video info)
    if (!ep || epLower === 'đang cập nhật' || epLower === 'coming soon') return 'Soon';

    // 4. Ongoing (Show Ep X/Total or just Ep X)
    // Extract patterns like "10/10"
    const matchRange = epLower.match(/(\d+\/\d+)/);
    if (matchRange) {
      const range = matchRange[1];
      if (range === '1/1') return 'Full';
      return range;
    }
    
    // Extract number from "Tập 2"
    const matchNumber = epLower.match(/tập\s+(\d+)/i);
    if (matchNumber) {
      const current = matchNumber[1];
      if (total) {
        const totalNum = total.match(/(\d+)/)?.[1];
        if (totalNum && totalNum !== '1') return `${current}/${totalNum}`;
      }
      return `Ep ${current}`;
    }
    
    return ep || '';
  }
};
