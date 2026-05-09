
const keyword = 'Đố Kỵ';
const SEARCH_URL = 'https://ophim1.com/v1/api/tim-kiem?keyword=' + encodeURIComponent(keyword);

async function findSlug() {
  const res = await fetch(SEARCH_URL);
  const data = await res.json();
  console.log(JSON.stringify(data.data.items.map(i => ({name: i.name, slug: i.slug})), null, 2));
}
findSlug();
