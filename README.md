# Cinque Terre Travel Guide

Content repository for [cinqueterre.travel](https://cinqueterre.travel) - a comprehensive travel guide to Italy's stunning Cinque Terre region.

## Overview

This repository contains the content (pages, collections, and configuration) that powers the Cinque Terre travel website. The content is rendered using the Cinque Terre theme from the [swarm.press site-builder](https://github.com/swarmpress/swarmpress).

## The Five Villages

The guide covers all five villages of Cinque Terre, listed from south to north:

| Village | Description |
|---------|-------------|
| **Riomaggiore** | The easternmost village with colorful cliffside houses tumbling down to the sea |
| **Manarola** | The most photographed village, famous for wine terraces and stunning sunsets |
| **Corniglia** | The quiet heart, perched 100m above the sea (382 steps to reach it!) |
| **Vernazza** | The crown jewel with its medieval tower and natural harbor |
| **Monterosso** | The largest village with sandy beaches and lemon groves |

## Content Structure

```
content/
├── config/
│   └── site.json              # Site-wide configuration
├── pages/
│   ├── village.json           # Village template (editorial design)
│   ├── riomaggiore.json       # Village-specific content
│   ├── manarola.json
│   ├── corniglia.json
│   ├── vernazza.json
│   ├── monterosso.json
│   ├── accommodations.json    # Hub pages
│   ├── culinary.json
│   ├── itinerary.json
│   ├── weather.json
│   ├── transportation.json
│   └── [village]/             # Village-specific sections
│       ├── restaurants.json
│       ├── hotels.json
│       ├── beaches.json
│       └── ...
└── collections/
    ├── accommodations/        # Hotels, B&Bs per village
    ├── restaurants/           # Restaurants per village
    ├── pois/                  # Points of interest
    ├── hikes/                 # Hiking trails
    ├── events/                # Local events
    ├── villages/              # Village metadata
    ├── weather/               # Climate data
    └── transportation/        # Transit information
```

## Page Types

### Editorial Pages
Rich, magazine-style pages with multiple content blocks:
- `hero-section` - Full-width hero with image and title
- `village-intro` - Lead story and village essentials
- `featured-carousel` - Editor's picks
- `trending-now` - Trending content
- `places-to-stay` - Accommodation highlights
- `eat-drink` - Restaurant recommendations
- `highlights` - Must-see attractions
- `curated-escapes` - Day trip ideas
- `latest-stories` - Recent articles
- `audio-guides` - Audio tour content
- `practical-advice` - Travel tips
- `newsletter` - Subscription form

### Collection Pages
Data-driven pages that aggregate collection items:
- Accommodations by village
- Restaurants by village
- Events calendar
- Hiking trail guides

## URL Structure

The site supports four languages (EN, DE, FR, IT) with the following URL patterns:

```
/{lang}                        # Homepage
/{lang}/village                # Village hub (all villages)
/{lang}/{village}              # Village overview (e.g., /en/riomaggiore)
/{lang}/{village}/{section}    # Village section (e.g., /en/vernazza/restaurants)
/{lang}/{hub-page}             # Hub pages (e.g., /en/accommodations)
```

## Development

### Running Locally

The content is rendered by the Cinque Terre theme. To run locally:

```bash
# From the swarmpress monorepo root
cd packages/site-builder/src/themes/cinque-terre

# Set content directory
export CONTENT_DIR=/path/to/cinqueterre.travel/content/pages

# Start dev server
npx astro dev --port 4323
```

### Building

```bash
# Build static site
./build-and-deploy.sh
```

### Content Guidelines

1. **Multilingual**: All text content should include translations for EN, DE, FR, IT
2. **Images**: Use high-quality Unsplash images with proper attribution
3. **SEO**: Include title and description for each page
4. **Blocks**: Use the editorial block types for rich content

## Navigation

The site features a "Coastal Spine" navigation system:
- Geographic village order (south to north)
- Village-colored indicators
- Expandable section menus
- Language switcher preserves context

## Collections Schema

Each collection type has a `_schema.json` file defining its structure. Collections are organized by village where applicable.

### Example: Restaurant Collection
```json
{
  "name": "Trattoria dal Billy",
  "village": "manarola",
  "cuisine": ["Ligurian", "Seafood"],
  "priceRange": "$$",
  "rating": 4.5,
  "coordinates": { "lat": 44.1067, "lng": 9.7264 }
}
```

## License

Content is proprietary. Theme and site-builder are part of swarm.press.

---

**Live Site**: [cinqueterre.travel](https://cinqueterre.travel)
