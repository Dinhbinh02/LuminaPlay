const apiKey = 'c9b386f7aeb407d15cdc5800577fbf16';
const url = `https://api.themoviedb.org/3/tv/300131?api_key=${apiKey}`;

fetch(url)
  .then(res => res.json().then(data => ({ status: res.status, data })))
  .then(res => {
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
    console.error('Error:', err);
  });
