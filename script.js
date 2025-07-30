const yearRange = { min: 1980, max: 2025 };

async function fetchGames(year) {
  const endpoint = 'https://query.wikidata.org/sparql';
  const query = `
    SELECT ?game ?gameLabel WHERE {
      ?game wdt:P31/wdt:P279* wd:Q7889.
      ?game wdt:P577 ?releaseDate.
      FILTER(YEAR(?releaseDate) = ${year})
      SERVICE wikibase:label { bd:serviceParam wikibase:language "tr,en". }
    }
  `;
  const url = endpoint + '?query=' + encodeURIComponent(query);
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/sparql-results+json' }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.results.bindings
      .map(item => item.gameLabel.value)
      .filter(name => !/^Q\\d+$/.test(name))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

function updateList(year) {
  const listContainer = document.getElementById('gameList');
  listContainer.innerHTML = '<p>Yükleniyor...</p>';
  fetchGames(year).then(games => {
    listContainer.innerHTML = '';
    const ul = document.createElement('ul');
    games.forEach(game => {
      const li = document.createElement('li');
      li.textContent = game;
      ul.appendChild(li);
    });
    listContainer.appendChild(ul);
  }).catch(err => {
    listContainer.innerHTML = '<p>Veri yüklenirken hata olustu.</p>';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('yearSlider');
  const yearLabel = document.getElementById('selectedYear');
  slider.min = yearRange.min;
  slider.max = yearRange.max;
  slider.value = yearRange.min;
  yearLabel.textContent = yearRange.min;
  updateList(yearRange.min);

  slider.addEventListener('input', () => {
    const year = slider.value;
    yearLabel.textContent = year;
    updateList(year);
  });
});
