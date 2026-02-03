# Web Interface Port - Implementation Guide

## 🎯 Overview

This document describes the port of the Django-based web interface to Express.js/TypeScript.

## 📊 Current Status

### ✅ Completed
1. **EJS Template Engine** - Installed and configured
2. **Directory Structure** - Created views and public directories
3. **EJS Templates** - Created for all main views:
   - `demo.ejs` - Pre-computed simulation replay with Phaser.js
   - `replay.ejs` - Replay from storage
   - `simulator_home.ejs` - Live simulation interface
   - `persona_state.ejs` - Agent state details

4. **Server Routes** - Planned implementation in `server.ts`:
   - `/` - Landing page
   - `/demo/:simCode/:step/:speed` - Demo view
   - `/replay/:simCode/:step` - Replay view
   - `/simulator_home` - Simulator interface
   - `/replay_persona_state/:simCode/:step/:personaName` - Persona details
   - `/simulations/list` - List available simulations
   - `/api/simulation/status` - API endpoint

### ⏳ In Progress
1. **Express.js Server** - Full implementation needed
2. **Static Asset Serving** - Verify all assets load correctly
3. **Phaser.js Integration** - Game engine initialization and rendering

### 📋 Remaining Tasks
1. **Complete Server Implementation**
   - Finish all route handlers
   - Add proper error handling
   - Implement AJAX endpoints
   
2. **Game Engine Integration**
   - Extract Phaser.js code to separate file
   - Implement sprite rendering
   - Add keyboard controls
   - Handle agent movement and updates

3. **Template Enhancements**
   - Add base layout template
   - Improve styling
   - Add responsive design

4. **Testing**
   - Test with existing simulation data
   - Verify demo mode works
   - Test replay functionality
   - Screenshot all views

## 🏗️ Architecture

### Original Django Structure
```
environment/frontend_server/
├── translator/
│   ├── views.py              # Django views (323 lines)
│   └── models.py             # Database models
├── templates/                # Django templates (2,456 lines total)
│   ├── base.html
│   ├── demo/demo.html
│   ├── home/home.html
│   ├── landing/landing.html
│   └── persona_state/persona_state.html
└── static_dirs/              # Static assets
    └── assets/
        ├── characters/
        └── the_ville/
```

### New Express.js Structure
```
src/frontend/
├── server.ts                 # Main Express server
├── views/                    # EJS templates
│   ├── demo.ejs
│   ├── replay.ejs
│   ├── simulator_home.ejs
│   └── persona_state.ejs
└── public/                   # Static assets (JS/CSS)
    ├── js/
    └── css/
```

## 🔄 Migration Mapping

### Django Views → Express Routes

| Django View | Django URL | Express Route | Status |
|------------|------------|---------------|--------|
| `landing()` | `/` | `GET /` | ✅ Planned |
| `demo()` | `/demo/:code/:step/:speed` | `GET /demo/:simCode/:step/:playSpeed?` | ✅ Planned |
| `replay()` | `/replay/:code/:step` | `GET /replay/:simCode/:step` | ✅ Planned |
| `simulator_home()` | `/simulator_home` | `GET /simulator_home` | ✅ Planned |
| `replay_persona_state()` | `/replay_persona_state/:code/:step/:name` | `GET /replay_persona_state/:simCode/:step/:personaName` | ✅ Planned |

### Template Language

| Django (Jinja2) | EJS | Example |
|-----------------|-----|---------|
| `{% for item in items %}` | `<% items.forEach(item => { %>` | Loop |
| `{{ variable }}` | `<%= variable %>` | Escape HTML |
| `{{ variable\|safe }}` | `<%- variable %>` | No escape |
| `{% if condition %}` | `<% if (condition) { %>` | Conditional |
| `{% extends "base.html" %}` | `<%- include('base') %>` | Include |

## 📝 Implementation Details

### 1. Demo View

The demo view is the most complex, requiring:

**Backend Logic**:
- Load `compressed_storage/{simCode}/master_movement.json`
- Load `compressed_storage/{simCode}/meta.json`
- Calculate start datetime based on step
- Prepare persona positions and movement data
- Pass data to template

**Frontend (Phaser.js)**:
- Initialize game canvas (1500x800, zoom 0.8)
- Load tilemap and sprites
- Create persona sprites at initial positions
- Update positions each frame based on movement data
- Display current time and agent details
- Handle play/pause controls

### 2. Replay View

Similar to demo but loads from `storage/` instead of `compressed_storage/`

### 3. Simulator Home

Live simulation interface that would connect to the backend WebSocket for real-time updates.

### 4. Persona State

Displays detailed information about a specific agent at a specific step:
- Current action and location
- Memory stream
- Current thoughts
- Planning state

## 🚀 Running the Server

```bash
# Install dependencies
npm install ejs

# Start frontend server
npm run start:frontend
# or
bun run src/frontend/server.ts

# Access at http://localhost:8000
```

## 🔧 Configuration

The server uses configuration from `src/config.ts`:

```typescript
export const config = {
  server: {
    frontendPort: 8000,
    backendPort: 8080
  }
};
```

## 📚 Dependencies

### Required Packages
- `express` - Web framework
- `ejs` - Template engine
- `@types/express` - TypeScript types
- `@types/ejs` - TypeScript types

### Frontend Libraries (CDN)
- `bootstrap@3.3.7` - UI framework (for compatibility with original templates)
- `phaser@3.55.2` - Game engine
- `jquery` - DOM manipulation (used in original)

## 🎮 Game Engine Details

### Phaser.js Configuration

```javascript
const config = {
  type: Phaser.AUTO,
  width: 1500,
  height: 800,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 } }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  scale: { zoom: 0.8 }
};
```

### Asset Loading

Assets are served from `environment/frontend_server/static_dirs/`:
- **Tilemap**: `/static/assets/the_ville/visuals/map_assets.png`
- **Map JSON**: `/static/assets/the_ville/matrix/the_ville_map.json`
- **Character Sprites**: `/static/assets/characters/movement_frames/{name}.png`
- **Profile Images**: `/static/assets/characters/profile/{name}.png`

### Movement System

- **Tile Width**: 32 pixels
- **Movement Speed**: Configurable (1, 2, 4, 8, 16, 32 pixels/frame)
- **Step Size**: 10 seconds of game time per step
- **Update Cycle**: Move sprites gradually towards target positions

## 🔍 Testing Strategy

### 1. Static Assets
- [ ] Verify tilemap loads
- [ ] Verify character sprites load
- [ ] Check profile images

### 2. Demo Mode
- [ ] Load existing simulation
- [ ] Verify personas appear at correct positions
- [ ] Test play/pause controls
- [ ] Verify time updates
- [ ] Check persona detail displays

### 3. Replay Mode
- [ ] Load from storage directory
- [ ] Verify step navigation
- [ ] Test keyboard controls

### 4. API Endpoints
- [ ] Test `/api/simulation/status`
- [ ] Test `/simulations/list`

## 🐛 Known Issues & Solutions

### Issue 1: Django Template Syntax
**Problem**: Django uses `{% %}` and `{{ }}` syntax
**Solution**: Convert to EJS `<% %>` and `<%= %>` syntax

### Issue 2: Static File Paths
**Problem**: Django's `{% static %}` template tag
**Solution**: Direct paths: `/static/assets/...`

### Issue 3: JSON Safety
**Problem**: Django's `|safe` filter for JSON
**Solution**: EJS's `<%- %>` unescaped output

## 📈 Next Steps

1. **Complete Server Implementation**
   - Finish all route handlers in `server.ts`
   - Test with existing simulation data

2. **Extract Game Logic**
   - Move Phaser.js code to separate `game.js` file
   - Make it reusable across views

3. **Add WebSocket Support**
   - For live simulation updates
   - Real-time agent communication

4. **Enhance Templates**
   - Create base layout
   - Add responsive design
   - Improve styling

5. **Documentation**
   - API documentation
   - User guide
   - Developer guide

## 🎯 Success Criteria

- [ ] All Django views ported to Express
- [ ] Demo mode works with existing simulations
- [ ] Replay mode functional
- [ ] Phaser.js renders agents correctly
- [ ] Time and movement updates work
- [ ] Static assets load correctly
- [ ] Responsive design
- [ ] Screenshots of all views

---

**Status**: 🚧 In Progress  
**Last Updated**: February 2026  
**Completion**: ~40% (Templates created, server structure planned)
