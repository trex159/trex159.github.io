// List of repositories to exclude from display
const excludedRepositories = [
  'test-repo',
  'temp-project',
  'example-repo'
  // Add more repository names to exclude them from display
];

// List of repositories with GitHub Pages (default display)
const pagesRepositories = [
  // Format: { name: 'INVESTOR', url: 'https://trex159.github.io/INVESTOR' }
    { name: 'INVESTOR', url: 'https://trex159.github.io/INVESTOR', displayname: 'Investor' },
    { name: 'TuringTest.RSO', url: 'https://trex159.github.io/TuringTest.RSO', displayname: 'Turingtest' },
    { name: 'Deutsch-Check', url: 'https://trex159.github.io/Deutsch-Check', displayname: 'Deutsch-Check' },
    { name: 'Color-Master', url: 'https://trex159.github.io/Color-Master', displayname: 'Farbraten' },
    { name: 'EnigmaM3', url: 'https://trex159.github.io/EnigmaM3', displayname: 'Enigma' },
    { name: 'Passwortsicherheitstester', url: 'https://trex159.github.io/Passwortsicherheitstester', displayname: 'Passwort-Sicherheit testen' },
    { name: 'hng', url: 'https://trex159.github.io/hng', displayname: 'Hungergames Simulator' }
];

// Returns the repositories to display based on the mode
function getDisplayRepositories(mode, allRepos) {
  if (mode === 'pages') {
    // Show only repos with GitHub Pages
    const pageNames = pagesRepositories.map(r => r.name);
    return allRepos.filter(repo => pageNames.includes(repo.name));
  } else if (mode === 'all') {
    // Show all repos except excludes
    return allRepos.filter(repo => !excludedRepositories.includes(repo.name));
  }
  // Default: all except excludes
  return allRepos.filter(repo => !excludedRepositories.includes(repo.name));
}

// Make available globally for script.js
window.excludedRepositories = excludedRepositories;
window.pagesRepositories = pagesRepositories;
window.getDisplayRepositories = getDisplayRepositories;
