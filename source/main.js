import { getRandomYear, getRandomElement } from './utils.js';
import { fetchSeriesForYear } from './fetchSeries.js';
import { fetchMatchesForSeries } from './fetchMatches.js';
import { fetchLatestMatchId, fetchScorecard } from './fetchTeams.js';
import { fetchTop11PlayersFromMatch } from './fetchTopPlayersfromMatch.js';
import { mapTopPerformersToTeamData } from './mapTopPerformersToTeamData.js';
import { API_KEY } from './config.js';

async function main() {
  // Inputs required
  const teamId1 = 255; // Replace with actual team ID
  const teamId2 = 64; // Replace with actual team ID
  const seriesType = 'league'; //One of the followings : international|league|domestic|women

  console.log('API key used is :', API_KEY);

  const matchIdForTeam1 = await fetchLatestMatchId(teamId1);
  console.log('Latest match id from team 1 ' + matchIdForTeam1);
  const matchIdForTeam2 = await fetchLatestMatchId(teamId2);
  console.log('Latest match id from team 2 ' + matchIdForTeam2);

  let teamData = {};

  if (matchIdForTeam1) {
    teamData.team1 = await fetchScorecard(matchIdForTeam1, teamId1);
  }

  if (matchIdForTeam2) {
    teamData.team2 = await fetchScorecard(matchIdForTeam2, teamId2);
  }

  console.log('Team Data:', teamData);

  const seriesList = await fetchSeriesForYear(seriesType);
  for (let i = 0; i < 4; i++) {
    var randomSeriesId = getRandomElement(seriesList);

    var randomMatchId;
    if (randomSeriesId) {
      console.log('Selected Series ID:', randomSeriesId);
      const matchList = await fetchMatchesForSeries(randomSeriesId);
      randomMatchId = getRandomElement(matchList);

      if (randomMatchId) {
        console.log('Selected Match ID:', randomMatchId);
      } else {
        console.log('No matches found for the selected series.');
        i--;
      }
    } else {
      console.log('No series found for the selected year.');
    }

    // For selected matchId find the scorecard and top 11 performer and their batting bowling position
    var topPerformers = await fetchTop11PlayersFromMatch(randomMatchId);
    console.log('Top 15 Performers (Sorted by Score):');
    console.table(topPerformers);

    const final11Players = mapTopPerformersToTeamData(topPerformers, teamData);
    console.log('Final 15 Players Strictly from Team Data:');
    console.table(final11Players);
  }
}

main();
