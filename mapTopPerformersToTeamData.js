export function mapTopPerformersToTeamData(topPerformers, teamData) {
    let finalTeam = [];

    topPerformers.forEach((player) => {
        let { position, team } = player;
        let teamDataRef = team === "Team1" ? teamData.team1 : teamData.team2;

        let selectedPlayer = null;

        if (position.startsWith("bat_")) {
            // Extract batting position index (bat_3 → index 2)
            let index = parseInt(position.split("_")[1]) - 1;
            if (index >= 0 && index < teamDataRef.battingOrder.length) {
                selectedPlayer = teamDataRef.battingOrder[index];
            }
        } else if (position.startsWith("bowl_")) {
            // Extract bowling position index (bowl_2 → index 1)
            let index = parseInt(position.split("_")[1]) - 1;
            if (index >= 0 && index < teamDataRef.bowlingOrder.length) {
                selectedPlayer = teamDataRef.bowlingOrder[index];
            }
        }

        if (selectedPlayer) {
            finalTeam.push({
                name: selectedPlayer,
                role: position.startsWith("bat_") ? "Batsman" : "Bowler",
                position,
                team,
            });
        }
    });

    return finalTeam;
}
