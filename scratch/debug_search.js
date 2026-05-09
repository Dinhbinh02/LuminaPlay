
const keyword = 'Phụ nhân đại quản thế kỷ 21';
const SEARCH_URL = 'https://ophim1.com/v1/api/tim-kiem?keyword=' + encodeURIComponent(keyword);

async function debugSearch() {
  console.log(`Searching Ophim for keyword: ${keyword}`);
  const res = await fetch(SEARCH_URL);
  const data = await res.json();
  
  if (!data.status || !data.data || !data.data.items) {
    console.log("No search results on Ophim");
    return;
  }

  console.log(`Found ${data.data.items.length} items on Ophim:`);
  data.data.items.forEach(item => {
    console.log(`- ${item.name} (${item.origin_name}) - Slug: ${item.slug} - Year: ${item.year}`);
  });
}

debugSearch();
