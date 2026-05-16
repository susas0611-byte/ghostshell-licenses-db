const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// 1. Setup Stealth Engine
puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());
app.use(cors()); // This allows your Windows App to connect without "Fetch Error"

// 2. Configuration
const VALID_LICENSE_KEY = "GHOST-SHELL-UNIVERSAL-2024";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "gh0st_admin_2024";

// 3. The Bot Engine
async function runGhostShell(config = {}) {
    console.log("🥷 Launching GhostShell Engine...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        const targetUrl = config.targetUrl || "https://www.google.com";
        console.log(`📍 Navigating to ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Keep running for 1 hour
        await new Promise(r => setTimeout(r, 3600000)); 

    } catch (err) {
        console.error("❌ Bot Error:", err);
    } finally {
        await browser.close();
        console.log("🛑 Browser closed.");
    }
}

// 4. UNIVERSAL HANDLER (Handles / and /admin/execute)
const handleRequest = async (req, res) => {
    const licenseKey = req.body.licenseKey || req.query.licenseKey;
    const { action, config } = req.body;
    const receivedToken = req.headers['x-admin-token'];

    console.log(`Incoming request. Key: ${licenseKey}, Action: ${action}`);

    // If the software is just checking the license
    if (licenseKey === VALID_LICENSE_KEY && action !== 'start-bot') {
        console.log("✅ License validated for Windows App.");
        return res.json({ 
            status: "success", 
            active: true, 
            message: "License Verified" 
        });
    }

    // If we are starting the bot via ReqBin or Remote
    if (action === 'start-bot') {
        if (receivedToken !== ADMIN_TOKEN) {
            return res.status(403).json({ error: "Invalid Admin Token" });
        }
        runGhostShell(config).catch(e => console.error(e));
        return res.json({ status: "success", message: "Bot Started" });
    }
 
    // Default response
    res.send('GhostShell License Server is Active 🚀');
};

// Map both paths to the same handler
app.all('/', handleRequest);
app.all('/admin/execute', handleRequest);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));