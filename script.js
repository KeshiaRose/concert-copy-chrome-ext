window.addEventListener('DOMContentLoaded', (event) => {
  const el = document.getElementById('run');
  if (el) {
    el.addEventListener('click', createText);
  }
});

async function createText() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);

  let domain = new URL(tab.url);
  domain = domain.hostname;
  let scrapers = {
    'www.axs.com': getAXS,
    'www.ticketmaster.com': getTM,
    'concerts.livenation.com': getLN,
    'www.ticketweb.com': getTW,
  };

  let res = await chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      func: scrapers[domain],
    })
    .catch(console.error);

  let niceUrl = tab.url.split('?')[0];
  let data = res[0].result;
  let output = `[${data.artist}](${niceUrl}) @ ${data.venue} - ${data.date}`;
  await navigator.clipboard.writeText(output);
  window.close();
}

function getAXS() {
  let artist = document
    .querySelector('.c-marquee__headliner')
    .innerText.replaceAll('\n', '')
    .trim();
  let venue = document
    .querySelector('.c-event-info__venue-name')
    .innerText.replaceAll('\n', '')
    .replaceAll(',', '')
    .trim();
  let date = document
    .querySelector('.c-event-info__table-date')
    .innerText.replaceAll('\n', '')
    .trim();

  let weekday = date.charAt(0) + date.toLowerCase().substr(1, 2);
  let month = date.charAt(4) + date.toLowerCase().substr(5, 2);
  let day = date.substr(8, 2).replace(',', '');
  date = `${weekday}, ${month} ${day}`;

  return { artist, venue, date };
}

function getTM() {
  let artist, venue, date;
  if (document.querySelector('.event-header__event-name-text')) {
    artist = document.querySelector('.event-header__event-name-text').innerText.trim();
    venue = document
      .querySelector('.event-header__event-location-link')
      .innerText.trim()
      .split(',')[0];
    date = document.querySelector('.event-header__event-date').innerText.trim();
  } else {
    artist = document.querySelector('[data-bdd="event-header-title"]').innerText.trim();
    venue = document.querySelector('[data-bdd="event-venue-info"]').innerText.trim().split(',')[0];
    date = document.querySelector('[data-bdd="event-header-date"]').innerText.trim();
  }

  let weekday = date.substr(0, 3);
  let month = date.substr(6, 3);
  let day = parseInt(date.substr(10, 2));
  date = `${weekday}, ${month} ${day}`;

  return { artist, venue, date };
}

function getLN() {
  let artist = document.querySelector('.event-header__event-name-text').innerText.trim();
  let venue = document
    .querySelector('.event-header__event-location-link')
    .innerText.trim()
    .split(',')[0];
  let date = document.querySelector('.event-header__event-date').innerText.trim();

  let weekday = date.substr(0, 3);
  let month = date.substr(6, 3);
  let day = parseInt(date.substr(10, 2));
  date = `${weekday}, ${month} ${day}`;

  return { artist, venue, date };
}

function getTW() {
  let artist = document.querySelector('.event-title span.big').innerText.trim();
  let venue = document.querySelector('.info-venue .info-title').innerText.trim();
  let date = document.querySelector('.info-time .info-title').innerText.trim();

  let weekday = date.substr(0, 3);
  let month = date.substr(4, 3);
  let day = parseInt(date.substr(8, 2));
  date = `${weekday}, ${month} ${day}`;

  return { artist, venue, date };
}

/*
 * TO ADD NEW VENDORS:
 * Update the scrapers object with the domain name as the key and the function name as the value
 * Create a new function with the same name as the value above
 * The function should return an object with the following properties:
 *   artist: string
 *   venue: string
 *   date: string
 */
