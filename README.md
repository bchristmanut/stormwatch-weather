# StormWatch Weather — free personal iPhone web app

A static Progressive Web App. Uses Open-Meteo (free for non-commercial use, attribution required), the U.S. National Weather Service for active alerts, Open-Meteo geocoding, and Zippopotam.us for U.S. ZIP lookups. No API keys.

## Publish for free using only an iPhone

1. Create or sign into a free account at https://github.com in Safari.
2. Create a **public** repository named `stormwatch-weather` (GitHub Pages on GitHub Free requires public repositories).
3. Upload the **six files** from the `stormwatch` folder into the root of that repository: `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `icon.png`. On iPhone, GitHub's mobile interface may require Safari's **Request Desktop Website** option to access the upload control. Alternatively use GitHub's web editor to create the files.
4. Open repository **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
5. Wait for deployment. Visit `https://YOUR-GITHUB-USERNAME.github.io/stormwatch-weather/` in Safari.
6. Tap Safari **Share → Add to Home Screen → Add**. Launch StormWatch from your Home Screen.
7. Tap the target icon to allow GPS, or search by city or ZIP.

## Important limitations

- No live radar or background push alerts in this version. Weather alerts are checked only when the app loads or you refresh.
- The current weather values are from a weather provider's latest available model/current dataset, not necessarily an instantaneous local station reading.
- Network is required for new forecasts. The app shell can load offline, but live weather cannot.
- The first matching city search result is selected; use a more specific query if needed.
- NWS point alerts are only supported in U.S. areas; some territories and API CORS/server behavior may vary.
- GitHub Pages makes the app source publicly visible. It does not expose your GPS location in the repository; browser requests to weather providers transmit selected coordinates.
- GitHub Pages free tier, weather service limits and terms can change.
- Do not rely on this app as your sole severe-weather warning source.

## Attribution

Weather data by [Open-Meteo](https://open-meteo.com/) under CC BY 4.0. NWS alerts from [weather.gov](https://www.weather.gov/).
