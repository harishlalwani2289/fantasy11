import { API_KEY } from './config.js';
import { getRandomYear } from './utils.js';

export function fetchSeriesForYear(type) {
  // One of the followings : international|league|domestic|women
  const from = ['league', 'women', 'domestic'].includes(type) ? 2015 : 2000;
  const to = 2024;

  const randomYear = getRandomYear(from, to);
  console.log('Selected Year for series:', randomYear);

  return fetch(
    `https://cricbuzz-cricket.p.rapidapi.com/series/v1/archives/${type}?year=${randomYear}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
        'x-rapidapi-key': API_KEY,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const seriesList = data.seriesMapProto[0]?.series || [];
      return seriesList.map((series) => series.id);
    })
    .catch((error) => {
      console.error('Error fetching series for year:', error);
      return [];
    });
}
