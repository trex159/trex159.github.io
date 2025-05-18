// Theme handling
const theme = localStorage.getItem('theme') || 
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);

document.getElementById('themeToggle').addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// GitHub API integration
const username = 'trex159';
const API_BASE_URL = 'https://api.github.com';
let repositories = [];
let filteredRepos = [];
let displayMode = localStorage.getItem('displayMode') || 'pages'; // 'pages' oder 'all'

// Language colors for repository cards
const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Go: '#00ADD8',
  Rust: '#dea584'
};

// Sprachunterstützung (i18n)
const translations = {
  de: {
    title: "trex159 Repositories",
    introTitle: "GitHub Repositories",
    introText: "Entdecke alle öffentlichen Repositories von trex159. Dieses Dashboard aktualisiert sich automatisch und bleibt mit der neuesten GitHub-Aktivität synchron.",
    searchPlaceholder: "Repositories durchsuchen...",
    allLanguages: "Alle Sprachen",
    sortUpdated: "Zuletzt aktualisiert",
    sortStars: "Meiste Sterne",
    sortName: "Name",
    loading: "Lade Repositories...",
    error: "Fehler beim Laden der Repositories",
    tryAgain: "Erneut versuchen",
    dataFetched: "Daten von GitHub API",
    autoUpdate: "Automatisch alle 5 Minuten aktualisiert",
    visitOnGitHub: "trex159 auf GitHub besuchen",
    noDescription: "Keine Beschreibung vorhanden",
    updated: "Aktualisiert",
    stars: "⭐",
    forks: "🔄"
  },
  en: {
    title: "trex159 Repositories",
    introTitle: "GitHub Repositories",
    introText: "Explore all public repositories by trex159. This dashboard automatically updates to stay in sync with the latest GitHub activity.",
    searchPlaceholder: "Search repositories...",
    allLanguages: "All Languages",
    sortUpdated: "Recently Updated",
    sortStars: "Most Stars",
    sortName: "Name",
    loading: "Loading repositories...",
    error: "Failed to load repositories",
    tryAgain: "Try Again",
    dataFetched: "Data fetched from GitHub's API",
    autoUpdate: "Updated automatically every 5 minutes",
    visitOnGitHub: "Visit trex159 on GitHub",
    noDescription: "No description provided",
    updated: "Updated",
    stars: "⭐",
    forks: "🔄"
  }
};

let currentLang = localStorage.getItem('lang') || 'de';

function t(key) {
  return translations[currentLang][key];
}

// Sprachumschalter
function setupLanguageSwitcher() {
  const langBtn = document.getElementById('langToggle');
  langBtn.textContent = currentLang === 'de' ? 'English' : 'Deutsch';
  langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'de' ? 'en' : 'de';
    localStorage.setItem('lang', currentLang);
    updateTexts();
    filterAndDisplayRepositories();
  });
}

// Texte dynamisch setzen
function updateTexts() {
  document.title = t('title');
  document.querySelector('h1').textContent = t('title');
  document.querySelector('.intro h2').textContent = t('introTitle');
  document.querySelector('.intro p').textContent = t('introText');
  document.getElementById('searchInput').placeholder = t('searchPlaceholder');
  // Filter-Optionen
  const languageFilter = document.getElementById('languageFilter');
  if (languageFilter) {
    languageFilter.options[0].textContent = t('allLanguages');
  }
  const sortBy = document.getElementById('sortBy');
  if (sortBy) {
    sortBy.options[0].textContent = t('sortUpdated');
    sortBy.options[1].textContent = t('sortStars');
    sortBy.options[2].textContent = t('sortName');
  }
  // Footer
  const footer = document.querySelector('.footer-content');
  if (footer) {
    footer.children[0].textContent = t('dataFetched');
    footer.children[1].textContent = t('autoUpdate');
    footer.children[2].textContent = t('visitOnGitHub');
  }
  // Loading/Error
  document.querySelector('#loading p').textContent = t('loading');
  document.querySelector('#error p').textContent = t('error');
  document.querySelector('#error button').textContent = t('tryAgain');
  // Umschalter für Seiten/Alle anzeigen
  setupDisplayModeSwitcher();
}

// GitHub Pages-Filter: Nur Repos mit Pages anzeigen
function isPagesRepo(repo) {
  // GitHub Pages ist aktiviert, wenn repo.has_pages === true
  return repo.has_pages;
}

// Fetch repositories
async function fetchRepositories() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const reposEl = document.getElementById('repositories');

  try {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    reposEl.classList.add('hidden');

    const response = await fetch(
      `${API_BASE_URL}/users/${username}/repos?per_page=100&sort=updated`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Repository-Showcase'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }

    let allRepos = await response.json();

    // Filter nach Excludes und Modus (pages/all)
    repositories = window.getDisplayRepositories(displayMode, allRepos);

    // Update language filter options
    updateLanguageOptions();

    // Initial filtering and display
    filterAndDisplayRepositories();

    loadingEl.classList.add('hidden');
    reposEl.classList.remove('hidden');
  } catch (error) {
    console.error('Error fetching repositories:', error);
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
  }
}

// Update language filter options
function updateLanguageOptions() {
  const languages = new Set(repositories
    .map(repo => repo.language)
    .filter(Boolean));
  
  const languageFilter = document.getElementById('languageFilter');
  languageFilter.innerHTML = `<option value="">${t('allLanguages')}</option>`;
  
  Array.from(languages).sort().forEach(language => {
    const option = document.createElement('option');
    option.value = language;
    option.textContent = language;
    languageFilter.appendChild(option);
  });
}

// Filter and display repositories
function filterAndDisplayRepositories() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const language = document.getElementById('languageFilter').value;
  const sortBy = document.getElementById('sortBy').value;

  // Apply filters
  filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm));
    const matchesLanguage = !language || repo.language === language;
    return matchesSearch && matchesLanguage;
  });

  // Apply sorting
  filteredRepos.sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return b.stargazers_count - a.stargazers_count;
      case 'updated':
        return new Date(b.updated_at) - new Date(a.updated_at);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  displayRepositories();
}

// Display repositories
function displayRepositories() {
  const reposEl = document.getElementById('repositories');
  reposEl.innerHTML = '';

  filteredRepos.forEach(repo => {
    const card = document.createElement('div');
    card.className = 'repository-card';

    const updatedDate = new Intl.DateTimeFormat(currentLang === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(repo.updated_at));

    // Wenn im Seitenmodus, dann Link zur GitHub Pages-Seite anzeigen und Displayname nutzen
    let pageLink = '';
    let repoDisplayName = repo.name;
    if (displayMode === 'pages') {
      const page = window.pagesRepositories.find(r => r.name === repo.name);
      if (page) {
        repoDisplayName = page.displayname || repo.name;
        pageLink = `<a href="${page.url}" target="_blank" rel="noopener noreferrer" style="margin-left:8px;color:var(--primary);font-size:0.95em;">🌐 ${page.url.replace('https://','')}</a>`;
      }
    }

    card.innerHTML = `
      <div class="repo-header">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-name">
          ${repoDisplayName}
        </a>
        ${pageLink}
      </div>
      <p class="repo-description">
        ${repo.description || t('noDescription')}
      </p>
      <div class="repo-meta">
        ${repo.language ? `
          <span>
            <span class="language-dot" style="background-color: ${languageColors[repo.language] || '#888'}"></span>
            ${repo.language}
          </span>
        ` : ''}
        <span>${t('stars')} ${repo.stargazers_count}</span>
        <span>${t('forks')} ${repo.forks_count}</span>
        <span>${t('updated')} ${updatedDate}</span>
      </div>
    `;

    reposEl.appendChild(card);
  });
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterAndDisplayRepositories);
document.getElementById('languageFilter').addEventListener('change', filterAndDisplayRepositories);
document.getElementById('sortBy').addEventListener('change', filterAndDisplayRepositories);

// Umschalter für Seiten/Alle anzeigen
function setupDisplayModeSwitcher() {
  const container = document.querySelector('.filter-options');
  if (!container) return;
  let btn = document.getElementById('displayModeToggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'displayModeToggle';
    btn.style.marginLeft = '1rem';
    btn.style.padding = '0.5rem 1rem';
    btn.style.borderRadius = '0.5rem';
    btn.style.border = '1px solid var(--border)';
    btn.style.background = 'var(--card-background)';
    btn.style.cursor = 'pointer';
    container.appendChild(btn);
  }
  function updateBtnText() {
    btn.textContent = displayMode === 'pages'
      ? (currentLang === 'de' ? 'Alle Codes anzeigen' : 'Show all code')
      : (currentLang === 'de' ? 'Nur Seiten anzeigen' : 'Show only pages');
  }
  btn.onclick = () => {
    displayMode = displayMode === 'pages' ? 'all' : 'pages';
    localStorage.setItem('displayMode', displayMode);
    fetchRepositories();
    updateBtnText();
  };
  updateBtnText();
}

// Auto-refresh repositories every 5 minutes
fetchRepositories();
setInterval(fetchRepositories, 5 * 60 * 1000);

// Sprachumschalter initialisieren
document.addEventListener('DOMContentLoaded', () => {
  setupLanguageSwitcher();
  updateTexts();
  setupDisplayModeSwitcher();
});