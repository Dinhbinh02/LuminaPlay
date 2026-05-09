
const slug = 'phu-nhan-dai-quan-the-ky-21';
const API_URL = 'https://ophim1.com/v1/api/phim/' + slug;

async function debugMapping() {
  console.log(`Checking Ophim for: ${slug}`);
  const res = await fetch(API_URL);
  const data = await res.json();
  
  if (!data.status || !data.movie) {
    console.log("Ophim movie not found");
    return;
  }

  const movie = data.movie;
  console.log(`Ophim Name: ${movie.name}`);
  console.log(`Ophim Origin Name: ${movie.origin_name}`);
  console.log(`Ophim Year: ${movie.year}`);
  console.log(`Ophim TMDB ID: ${movie.tmdb?.id}`);

  // Search TMDB
  const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjOWIzODZmN2FlYjQwN2QxNWNkYzU4MDA1NzdmYmYxNiIsIm5iZiI6MTc3ODI2MDIwMy41NCwic3ViIjoiNjlmZTE4ZWJiMDQyNzY2YmIxYTVlY2NkIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.Q41MMQ4WW2iNGEcbRwgUAK9h5LCwzpEHk7sF8f2mNfw";
  
  const searchQueries = [movie.origin_name, movie.name];
  
  for (const query of searchQueries) {
    console.log(`\nSearching TMDB for: "${query}"`);
    const tmdbUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=vi-VN&page=1`;
    const tmdbRes = await fetch(tmdbUrl, {
      headers: { 'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}` }
    });
    const tmdbData = await tmdbRes.json();
    
    console.log(`Found ${tmdbData.results?.length || 0} results`);
    tmdbData.results?.slice(0, 3).forEach((r, i) => {
      console.log(`Result ${i+1}: ${r.title || r.name} (${(r.release_date || r.first_air_date || '').split('-')[0]}) - ID: ${r.id} - Type: ${r.media_type}`);
    });
  }
}

debugMapping();
