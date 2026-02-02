/**
 * Express.js Frontend Server
 * Replaces the Django frontend server with a modern Express.js implementation
 */

import express from 'express';
import { join } from 'path';
import { config } from '../config.js';

const app = express();
const port = config.server.frontendPort;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/static', express.static(join(process.cwd(), 'environment/frontend_server/static_dirs')));

// Health check endpoint
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Generative Agents - Environment Server</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 30px;
            backdrop-filter: blur(10px);
          }
          h1 {
            margin: 0 0 20px 0;
          }
          .status {
            background: rgba(76, 175, 80, 0.3);
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
          }
          .info {
            margin-top: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 5px;
          }
          code {
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎮 Generative Agents Environment Server</h1>
          <div class="status">
            <strong>✅ Your environment server is up and running!</strong>
          </div>
          <div class="info">
            <p><strong>Server Type:</strong> Express.js (Node.js/Bun.js)</p>
            <p><strong>Port:</strong> ${port}</p>
            <p><strong>Backend:</strong> OpenRouter API</p>
            <p><strong>Status:</strong> Ready to simulate</p>
            <hr style="border-color: rgba(255,255,255,0.2)">
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Start the backend server: <code>bun run dev</code></li>
              <li>Visit the simulator: <a href="/simulator_home" style="color: #ffeb3b">/simulator_home</a></li>
              <li>Replay simulations: <code>/replay/&lt;sim-name&gt;/1/</code></li>
              <li>Demo mode: <code>/demo/&lt;sim-name&gt;/1/3/</code></li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Simulator home page
app.get('/simulator_home', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Simulator Home</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: #fff;
          }
          h1 { color: #4CAF50; }
          .info {
            background: #2a2a2a;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Smallville Simulator</h1>
        <div class="info">
          <p>This is the simulator interface. In the full implementation, you would see:</p>
          <ul>
            <li>Interactive map of Smallville</li>
            <li>Real-time agent movements</li>
            <li>Agent status and actions</li>
            <li>Keyboard controls for navigation</li>
          </ul>
          <p><strong>Note:</strong> The full frontend visualization requires the complete port of the simulation engine and rendering system.</p>
        </div>
      </body>
    </html>
  `);
});

// Replay endpoint
app.get('/replay/:simName/:step', (req, res) => {
  const { simName, step } = req.params;
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Replay - ${simName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: #fff;
          }
        </style>
      </head>
      <body>
        <h1>Replay: ${simName}</h1>
        <p>Starting from step: ${step}</p>
        <p>Replay functionality will be available once the full simulation system is ported.</p>
      </body>
    </html>
  `);
});

// Demo endpoint
app.get('/demo/:simName/:step/:speed', (req, res) => {
  const { simName, step, speed } = req.params;
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Demo - ${simName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: #fff;
          }
        </style>
      </head>
      <body>
        <h1>Demo: ${simName}</h1>
        <p>Starting from step: ${step}</p>
        <p>Speed: ${speed}/5</p>
        <p>Demo functionality will be available once the full simulation system is ported.</p>
      </body>
    </html>
  `);
});

// API endpoint for simulation state (for future WebSocket integration)
app.get('/api/simulation/status', (_req, res) => {
  res.json({
    status: 'ready',
    backend: 'openrouter',
    port: config.server.backendPort,
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Frontend server running at http://localhost:${port}`);
  console.log(`📍 Visit http://localhost:${port} to check server status`);
  console.log(`🎮 Simulator home: http://localhost:${port}/simulator_home`);
});

export default app;
