# RouteArt

**[Live App](https://route-art-nine.vercel.app/)**

A web app that generates running and walking routes shaped like images, symbols, or words. Pick a city, choose a shape (or type a word), and RouteArt maps it onto real streets. Download the route as a GPX file and load it into Strava, Garmin, Apple Watch, or any GPS tracker to draw art with your runs.

## How It Works

1. Search for a city or starting location
2. Pick a shape from the library or switch to word mode and type a short word
3. Choose a size (S/M/L/XL) and pace (run or walk)
4. Hit **Generate Route** — the app converts the shape into waypoints, snaps them to real walkable streets using OSRM, and displays the route on an interactive map
5. Download the GPX file and import it into your favorite fitness app

## Features

- **Shape library** — hearts, stars, animals, arrows, and more
- **Word mode** — type up to 8 characters and the route spells it out on the map
- **Real street routing** — uses OSRM (Open Source Routing Machine) to snap shapes to walkable roads
- **GPX export** — works with Strava, Garmin Connect, Komoot, Apple Watch, and more
- **Distance & time estimates** — shows route distance and estimated completion time
- **Mobile-friendly** — responsive layout for planning routes on your phone

## Tech Stack

React, TypeScript, Vite, Tailwind CSS, Leaflet (maps), OSRM (routing)

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the dev server:**

   ```bash
   npm run dev
   ```

3. **Open** [http://localhost:5173](http://localhost:5173) in your browser.

No API keys or database required — the app uses free, open services (OpenStreetMap tiles and OSRM routing).

## Project Structure

```
app/
├── src/
│   ├── App.tsx                # Main app with sidebar controls and map
│   ├── components/
│   │   ├── CitySearch.tsx     # Location search with autocomplete
│   │   ├── ShapePicker.tsx    # Visual grid of available shapes
│   │   └── RouteMap.tsx       # Interactive Leaflet map
│   └── lib/
│       ├── routing.ts         # Shape-to-waypoint conversion and OSRM routing
│       ├── shapes.ts          # Shape definitions (point arrays)
│       ├── letters.ts         # Letter/word point generation
│       └── gpx.ts             # GPX file generation and download
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── package.json
└── vite.config.ts
```
