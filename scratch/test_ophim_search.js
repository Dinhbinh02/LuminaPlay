const API_URL = 'https://ophim1.com/v1/api';

async function search(keyword) {
    const res = await fetch(`${API_URL}/tim-kiem?keyword=${keyword}`);
    const data = await res.json();
    console.log(`Search results for "${keyword}":`);
    data.data.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.origin_name}) - Year: ${item.year} - Slug: ${item.slug}`);
    });
}

search('re:zero');
