const fs = require('fs').promises;
const path = require('path');

class ExtensionUpdateController {
  constructor() {
    // Store active SSE connections
    this.clients = new Set();
    this.currentVersion = null;

    // Load current version on startup
    this.loadCurrentVersion();
  }

  async loadCurrentVersion() {
    try {
      const versionPath = path.join(__dirname, '../../version.json');
      const versionData = await fs.readFile(versionPath, 'utf8');
      const versionInfo = JSON.parse(versionData);
      this.currentVersion = versionInfo.version;
      console.log(`📦 Extension version loaded: ${this.currentVersion}`);
    } catch (error) {
      console.error('Error loading version:', error);
      this.currentVersion = '1.0.0';
    }
  }

  /**
   * SSE endpoint untuk real-time update notifications
   * GET /api/extension/updates/stream
   */
  streamUpdates(req, res) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      currentVersion: this.currentVersion,
      message: 'Connected to update stream'
    })}\n\n`);

    // Store client connection
    const clientId = Date.now();
    const client = { id: clientId, res };
    this.clients.add(client);

    console.log(`📡 SSE Client connected: ${clientId} (Total: ${this.clients.size})`);

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(`:heartbeat\n\n`);
      } catch (error) {
        console.error('Heartbeat error:', error);
        clearInterval(heartbeatInterval);
      }
    }, 30000);

    // Handle client disconnect
    req.on('close', () => {
      clearInterval(heartbeatInterval);
      this.clients.delete(client);
      console.log(`📡 SSE Client disconnected: ${clientId} (Total: ${this.clients.size})`);
    });
  }

  /**
   * Trigger update notification to all connected clients
   * Called when new version is deployed
   */
  async notifyUpdate(newVersion, changelog) {
    console.log(`📢 Broadcasting update notification: ${newVersion} to ${this.clients.size} clients`);

    const backend = process.env.SITE_NAME || 'unknown';
    const downloadUrl = `http://${req.get('host')}/downloads/extensions-${backend}-v${newVersion}.xpi`;

    const updateData = {
      type: 'update-available',
      version: newVersion,
      currentVersion: this.currentVersion,
      changelog: changelog,
      downloadUrl: downloadUrl,
      timestamp: new Date().toISOString()
    };

    // Send to all connected clients
    for (const client of this.clients) {
      try {
        client.res.write(`data: ${JSON.stringify(updateData)}\n\n`);
      } catch (error) {
        console.error('Error sending update to client:', error);
        this.clients.delete(client);
      }
    }

    // Update current version
    this.currentVersion = newVersion;
  }

  /**
   * Manual trigger endpoint (for testing or admin)
   * POST /api/extension/updates/trigger
   */
  async triggerUpdate(req, res) {
    try {
      await this.loadCurrentVersion();

      const versionPath = path.join(__dirname, '../../version.json');
      const versionData = await fs.readFile(versionPath, 'utf8');
      const versionInfo = JSON.parse(versionData);

      await this.notifyUpdate(
        versionInfo.version,
        versionInfo.changelog[versionInfo.version] || []
      );

      res.json({
        success: true,
        message: `Update notification sent to ${this.clients.size} clients`,
        version: versionInfo.version
      });
    } catch (error) {
      console.error('Error triggering update:', error);
      res.status(500).json({
        success: false,
        message: 'Error triggering update',
        error: error.message
      });
    }
  }

  /**
   * Get current connection stats
   * GET /api/extension/updates/stats
   */
  getStats(req, res) {
    res.json({
      success: true,
      stats: {
        connectedClients: this.clients.size,
        currentVersion: this.currentVersion
      }
    });
  }
}

// Create singleton instance
const extensionUpdateController = new ExtensionUpdateController();

module.exports = extensionUpdateController;
