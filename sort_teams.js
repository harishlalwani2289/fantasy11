const fs = require('fs');

// Read JSON file
fs.readFile('team_id.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        // Parse JSON
        const jsonData = JSON.parse(data);

        // Check if list exists
        if (!jsonData.list || !Array.isArray(jsonData.list)) {
            console.error('Invalid JSON format: "list" key missing or not an array');
            return;
        }

        // Sort the list by teamId in ascending order
        jsonData.list.sort((a, b) => a.teamId - b.teamId);

        // Convert back to JSON format with indentation
        const sortedJson = JSON.stringify(jsonData, null, 4);

        // Write sorted JSON to a new file
        fs.writeFile('sorted_team_id.json', sortedJson, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('Sorted data saved to sorted_team_id.json successfully!');
        });

    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});
