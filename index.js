import { getRandomYear, getRandomElement } from './utils.js';
import { fetchSeriesForYear } from './fetchSeries.js';
import { fetchMatchesForSeries } from './fetchMatches.js';
import { fetchLatestMatchId, fetchScorecard } from './fetchTeams.js';
import { fetchTop11PlayersFromMatch } from './fetchTopPlayersfromMatch.js';
import { mapTopPerformersToTeamData } from './mapTopPerformersToTeamData.js';

export async function analyzeTeams() {
  console.log('Analyze button clicked!');
  const teamId1 = parseInt(document.getElementById('teamId1').value, 10); // Convert to number
  console.log('Team id 1 ', teamId1);
  const teamId2 = parseInt(document.getElementById('teamId2').value, 10); // Convert to number
  console.log('Team id 2 ', teamId2);
  const seriesType = document.getElementById('seriesType').value;
  console.log('Series type ', seriesType);

  let teamData = {};

  const matchIdForTeam1 = await fetchLatestMatchId(teamId1);
  console.log('Match id for team1 to fetch last playing 11 ' + matchIdForTeam1);
  const matchIdForTeam2 = await fetchLatestMatchId(teamId2);
  console.log('Match id for team2 to fetch last playing 11 ' + matchIdForTeam2);

  if (matchIdForTeam1) {
    teamData.team1 = await fetchScorecard(matchIdForTeam1, teamId1);
    console.log('teamData.team1:', teamData.team1);
  } else {
    console.log('No match ID found for Team 1');
    teamData.team1 = { battingOrder: [], bowlingOrder: [] };
  }

  if (matchIdForTeam2) {
    teamData.team2 = await fetchScorecard(matchIdForTeam2, teamId2);
    console.log('teamData.team2:', teamData.team2);
  } else {
    console.log('No match ID found for Team 2');
    teamData.team2 = { battingOrder: [], bowlingOrder: [] };
  }

  console.log('teamData playing 11 last match :', teamData);

  const seriesList = await fetchSeriesForYear(seriesType);
  if (seriesList.length === 0) {
    console.log('No series found for the selected type and year.');
    displayResults([]);
    return;
  }

  let finalTeamsData = [];

  for (let i = 0; i < 4; i++) {
    const randomSeriesId = getRandomElement(seriesList);
    if (!randomSeriesId) {
      console.log(`No series ID available for Fantasy Team ${i + 1}`);
      i--; // Ensure we try again to get 4 teams
      continue;
    }

    const matchList = await fetchMatchesForSeries(randomSeriesId);
    if (matchList.length === 0) {
      console.log(`No matches found for series ${randomSeriesId}`);
      i--; // Ensure we try again to get 4 teams
      continue;
    }

    const randomMatchId = getRandomElement(matchList);
    if (!randomMatchId) {
      console.log(`No match ID available for Fantasy Team ${i + 1}`);
      i--; // Ensure we try again to get 4 teams
      continue;
    }

    const topPerformers = await fetchTop11PlayersFromMatch(randomMatchId);
    if (topPerformers.length === 0) {
      console.log(`No top performers found for match ${randomMatchId}`);
      i--; // Ensure we try again to get 4 teams
      continue;
    }

    const final11Players = mapTopPerformersToTeamData(topPerformers, teamData);
    if (final11Players.length === 0) {
      console.log(`No final 11 players mapped for Fantasy Team ${i + 1}`);
      i--; // Ensure we try again to get 4 teams
      continue;
    }

    finalTeamsData.push({
      title: `Fantasy Team ${i + 1}`,
      players: final11Players,
    });
  }

  if (finalTeamsData.length > 0) {
    displayResults(finalTeamsData);
  } else {
    console.log('No fantasy teams were generated. Check the API responses.');
    displayResults([]);
  }
}
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('analyzeBtn').addEventListener('click', analyzeTeams);
});

window.analyzeTeams = analyzeTeams;

function displayResults(teamsData) {
  console.log(teamsData);
  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = ''; // Clear previous results

  teamsData.forEach((teamData, teamIndex) => {
    // Create team title
    const teamTitle = document.createElement('h2');
    teamTitle.textContent = teamData.title;
    resultsContainer.appendChild(teamTitle);

    // Create table
    const table = document.createElement('table');
    table.border = '1';
    table.style.width = '80%';
    table.style.margin = '10px auto';

    // Table Header
    table.innerHTML = `
            <thead>
                <tr>
                    <th>Index</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Position</th>
                    <th>Team</th>
                </tr>
            </thead>
            <tbody>
                ${teamData.players
                  .map(
                    (player, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${player.name}</td>
                        <td>${player.role}</td>
                        <td>${player.position}</td>
                        <td>${player.team}</td>
                    </tr>`
                  )
                  .join('')}
            </tbody>
        `;

    resultsContainer.appendChild(table);
  });
}
