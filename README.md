# Travel Bangladesh

A modern Bangladesh travel discovery platform powered by weather, maps and location-based recommendations.

## Features

- Premium responsive travel UI for mobile, tablet and desktop
- 50+ seed destinations spanning all 8 divisions
- Search by place, district, division, category and tags
- Multi-filter exploration and sorting
- Leaflet + OpenStreetMap interactive maps
- Browser geolocation and distance calculations
- Live weather via Open-Meteo with localStorage caching
- Explainable recommendation scoring
- Destination detail modal with weather, map and nearby places
- Favorites and recently viewed destinations via localStorage
- Skeleton loading, empty states and friendly error handling
- Semantic HTML, keyboard-friendly controls and reduced-motion support
- SEO metadata, manifest and Vercel-ready configuration

## Tech stack

- HTML5
- CSS3 with CSS variables and responsive media queries
- Vanilla JavaScript ES modules
- Leaflet 1.9.4
- OpenStreetMap tiles
- Open-Meteo Forecast API
- Vercel static hosting / optional serverless API boundary

## Project structure

```text
/
├── index.html
├── explore.html
├── map.html
├── about.html
├── assets/
├── css/
│   ├── style.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── weather.js
│   ├── map.js
│   ├── search.js
│   ├── recommendations.js
│   ├── favorites.js
│   └── utils.js
├── data/
│   └── destinations.json
├── api/
│   └── weather.js
├── manifest.json
├── robots.txt
├── vercel.json
└── README.md
```

## Local setup

Because this project uses ES modules, serve the folder from a local HTTP server rather than opening `index.html` directly with `file://`.

### Option A — Python

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

### Option B — Node

Use any simple static server, for example `npx serve .`.

No build step is required.

## Weather API configuration

The current implementation uses **Open-Meteo**, which provides the required current weather fields without a private API key for this use case. Therefore there is intentionally **no secret key in the repository** and no `.env` file is required for the default setup.

The weather service is isolated in `js/weather.js`. If you later replace Open-Meteo with a provider requiring a secret credential:

1. Put `WEATHER_API_KEY` in Vercel → Project → Settings → Environment Variables.
2. Do not put the key in `js/*.js`.
3. Route requests through `api/weather.js` (or another Vercel Function) so the secret remains server-side.
4. Update `js/weather.js` to call `/api/weather?...` instead of the provider directly.

## GitHub upload

```bash
git init
git add .
git commit -m "Build Travel Bangladesh discovery platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Before pushing, verify that no real credentials exist:

```bash
git grep -nE "(sk-|api[_-]?key|secret|password)" -- . ':!README.md'
```

## Vercel deployment

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Framework preset: **Other** / static site.
4. Build command: leave empty.
5. Output directory: `.`.
6. Deploy.
7. If you switch to a keyed weather provider, add `WEATHER_API_KEY` in Vercel Environment Variables and redeploy.

## Screenshots placeholder

Add production screenshots here after deployment, for example:

- Home hero
- Explore filters
- Full map
- Destination detail
- Mobile home

## Data model

Each destination is stored as structured metadata with:

`id`, `name`, `division`, `district`, `upazila`, `category`, `description`, `latitude`, `longitude`, `image`, `gallery`, `bestTime`, `tags`, `rating`, `weatherPreference`, `estimatedVisitDuration`, `facilities`, `featured`, `indoorOutdoor`, `popularity`.

The seed catalog is intentionally not presented as every attraction in Bangladesh. Add thousands of destinations later without changing the rendering architecture.

## Recommendation model

The current transparent score is conceptually:

- Weather suitability: 0–40
- Distance: 0–25
- Preference/tag match: 0–20
- Catalog rating signal: 0–15

The UI also displays short reasons such as weather, distance and catalog rating so users can understand why a place surfaced.

## Important content note

Destination ratings in the seed data are **catalog editorial signals**, not fake user-review counts. They are not presented as customer reviews.

Photography URLs are remote illustrative travel photography and should be replaced with verified destination-specific imagery before commercial launch.

## Future roadmap

- Replace illustrative imagery with licensed, verified destination photography
- Add Bengali translations and bilingual search aliases
- Add richer district-level datasets and verified local tips
- Add weather forecasts and rain probability
- Add route-aware travel time using a routing provider
- Add map marker clustering for a much larger dataset
- Add shareable destination URLs
- Add optional PWA service worker and offline cache
- Add analytics with privacy controls
- Add CMS/data import pipeline for destination editors

## License

Choose and add a project license before public redistribution. Third-party map, weather and image services retain their own terms and attribution requirements.
