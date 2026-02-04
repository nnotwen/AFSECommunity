# AFSE Community Guidelines Resource Hub

A comprehensive TypeScript web application providing calculators, databases, and community resources for **Anime Fighting Simulator** (AFSE) players.

## Overview

This is an interactive dashboard built with **jQuery**, **Bootstrap**, and **TypeScript** that consolidates essential game information into a single, user-friendly interface. The application features a cyberpunk-themed UI with real-time data loading and filtering capabilities.

## Features

### 📊 Dashboard

- Welcome status and version information
- Real-time changelog updates
- Community guidelines overview

### 🧮 Calculator

- NPC & Incremental Calculator
- Resource optimization tools

### ⚡ Powers & Skills

- Complete power skill database
- Categorized ability listings
- Detailed descriptions for each skill

### 🎯 Champions

- Full champion roster with filtering
- Search functionality (by name)
- Multiple sort options:
  - Name (Ascending/Descending)
  - Chance (Ascending/Descending)
  - Selling Cost (Ascending/Descending)
- Board-based filtering (Board 1, Board 2, Limited)

### 🎮 Gacha System

- Gacha probability information
- Pull mechanics documentation

### 💻 Private Server Commands

- Administrative commands reference
- Copy-to-clipboard functionality
- Organized by command category
- Batch copy all commands feature

### 🎁 Redemption Codes

- Active and expired code listings
- One-click copy to clipboard
- Regular updates

### 🗺️ Quest Lines

- Complete quest database
- Requirements and rewards display
- Quest line categorization
- Easy filtering by questline

### ✨ Special Abilities

- Special ability database
- Ability details and mechanics
- Category-based organization

### 🤖 Auto-Train Guide

- OP Auto Clicker configuration
- MS delay recommendations by stat type
- Setup instructions
- Troubleshooting guide
- Ping optimization tips

### 👥 Credits

- Development team information
- Version tracking
- Acknowledgements

## Technology Stack

- **Frontend Framework**: jQuery 3.x
- **Language**: TypeScript
- **UI Framework**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Build Tool**: Vite (inferred)
- **Styling**: Custom CSS with cyberpunk theme

## Project Structure

```
src/
├── main.ts                 # Main application logic
├── components/
│   └── toast.ts           # Toast notifications
├── utils/
│   ├── renderChampion.ts  # Champion card rendering
│   └── idGenerator.ts     # Unique ID generation
└── types/
        └── data.ts            # TypeScript interfaces
```

## Data Sources

The application loads data from JSON files in the `/data` directory:

- `config.json` - Application configuration and versioning
- `champion.json` - Champion database
- `codes.json` - Redemption codes
- `commands.json` - Private server commands
- `powerskill.json` - Power skills database
- `questline.json` - Quest information
- `specials.json` - Special abilities
- `autoclick.json` - Auto-clicker configurations

## Key Functions

### Tab Management

- Dynamic tab generation with unique IDs
- Lazy-loaded content with spinners
- Smooth fade transitions

### Search & Filtering

- Real-time champion search
- Multi-criterion sorting
- Board-based filtering for champions
- Category filtering for powers, quests, and specials

### Clipboard Operations

- Copy individual codes/commands
- Batch copy all commands
- Toast notifications for user feedback

### HTML Escaping

- XSS protection via `escapeHTML()` function
- Safe rendering of user-provided data

## Usage

1. **Navigate Tabs**: Click navbar buttons to switch between sections
2. **Search Champions**: Type in the search box to filter by name
3. **Sort Data**: Use dropdown selectors to reorder displayed items
4. **Copy Content**: Click codes or commands to copy to clipboard
5. **Filter Results**: Use category/board selectors to narrow results

## Configuration

Version and metadata are loaded from `config.json`. Update this file to:

- Change application version
- Modify welcome messages
- Update changelog entries

## Browser Support

- Modern browsers with ES6+ support
- Requires JavaScript enabled
- Bootstrap 5 compatible browsers

## Performance Notes

- Lazy loading of tab content
- Efficient DOM manipulation with jQuery
- Client-side filtering for instant results
- No external API calls required

## Credits

**Developer**: KAGESAN21  
**UI/UX**: KAGESAN21  
**Data Analysis**: KAGESAN21

Built for the **AFSE Community** | v4.4.1
