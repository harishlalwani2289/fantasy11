export function getRandomYear(startYear, endYear) {
    return Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
}


export function getRandomElement(array) {
    if (array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
}