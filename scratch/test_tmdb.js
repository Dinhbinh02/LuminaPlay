const TMDB_API_KEY = 'c9b386f7aeb407d15cdc5800577fbf16';
const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOWIzODZmN2FlYjQwN2QxNWNkYzU4MDA1NzdmYmYxNiIsIm5iZiI6MTc3ODI2MDIwMy41NCwic3ViIjoiNjlmZTE4ZWJiMDQyNzY2YmIxYTVlY2NkIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.Q41MMQ4WW2iNGEcbRwgUAK9h5LCwzpEHk7sF8f2mNfw';
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  if (TMDB_API_KEY && !TMDB_ACCESS_TOKEN) {
    url.searchParams.append('api_key', TMDB_API_KEY);
  }
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const headers = {};
  if (TMDB_ACCESS_TOKEN) {
    headers['Authorization'] = `Bearer ${TMDB_ACCESS_TOKEN}`;
  }

  try {
    const res = await fetch(url.toString(), { headers });
    console.log(`[${res.status}] ${endpoint} params:`, JSON.stringify(params));
    if (!res.ok) {
      const text = await res.text();
      console.log('Error payload:', text);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Fetch exception for ${endpoint}:`, err);
    return null;
  }
}

async function run() {
  console.log('--- Testing TMDB API calls ---');
  
  // 1. Romance (genre 10749)
  const romance = await fetchTMDB('/discover/movie', { with_genres: '10749', sort_by: 'popularity.desc', page: '1' });
  console.log(`Romance results count: ${romance?.results?.length || 0}`);
  
  // 2. Action (genre 28)
  const action = await fetchTMDB('/discover/movie', { with_genres: '28', sort_by: 'popularity.desc', page: '1' });
  console.log(`Action results count: ${action?.results?.length || 0}`);

  // 3. Netflix Movies (companies 178464|198834|185004|145174|171251)
  const today = new Date().toISOString().split('T')[0];
  const netflixMovies = await fetchTMDB('/discover/movie', {
    with_companies: '178464|198834|185004|145174|171251',
    sort_by: 'primary_release_date.desc',
    'primary_release_date.lte': today,
    'vote_count.gte': '5',
    page: '1'
  });
  console.log(`Netflix movies count: ${netflixMovies?.results?.length || 0}`);

  // 4. Netflix TV (network 213)
  const netflixTV = await fetchTMDB('/discover/tv', {
    with_networks: '213',
    sort_by: 'first_air_date.desc',
    'first_air_date.lte': today,
    'vote_count.gte': '5',
    page: '1'
  });
  console.log(`Netflix TV count: ${netflixTV?.results?.length || 0}`);
}

run();
