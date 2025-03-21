import { API_KEY } from './config.js';
import { getRandomElement } from './utils.js';

export function fetchMatchesForSeries(seriesId) {
    return fetch(`https://cricbuzz-cricket.p.rapidapi.com/series/v1/${seriesId}`, {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
            'x-rapidapi-key': API_KEY,
        },
    })
    .then((response) => response.json())
    .then((data) => {
        let matches = [];
        if (data.matchDetails) {
            data.matchDetails.forEach((matchGroup) => {
                if (matchGroup.matchDetailsMap && matchGroup.matchDetailsMap.match) {
                    matchGroup.matchDetailsMap.match.forEach((match) => {
                        if (match.matchInfo && match.matchInfo.matchId) {
                            matches.push(match.matchInfo.matchId);
                        }
                    });
                }
            });
        }
        return matches;
    })
    .catch((error) => {
        console.error('Error fetching matches for series:', error);
        return [];
    });
}