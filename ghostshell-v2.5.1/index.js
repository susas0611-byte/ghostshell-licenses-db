const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// 1. Setup Stealth Engine
puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());
app.use(cors()); 

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

        await new Promise(r => setTimeout(r, 3600000)); 

    } catch (err) {
        console.error("❌ Bot Error:", err);
    } finally {
        await browser.close();
        console.log("🛑 Browser closed.");
    }
}

// 4. IMPROVED HANDLER (Prevents HTML responses)
const handleRequest = async (req, res) => {
    // Check both body (POST) and query (GET)
    const licenseKey = req.body.license_key || req.body.licenseKey || req.query.licenseKey;
    const action = req.body.action;
    const config = req.body.config;
    const receivedToken = req.headers['x-admin-token'];

    console.log(`Incoming request. Key: ${licenseKey}, Path: ${req.path}`);

    // LOGIC A: License Validation (For Windows App)
    if (licenseKey === VALID_LICENSE_KEY) {
        console.log("✅ License validated.");
        return res.json({ 
            status: "success", 
            serverStatus: "valid", // Added to match your App's logic
            expires_at: "2027-01-01T00:00:00Z", // Added for App check
            message: "License Verified" 
        });
    }

    // LOGIC B: Start Bot (For Admin)
    if (action === 'start-bot') {
        if (receivedToken !== ADMIN_TOKEN) {
            return res.status(403).json({ status: "error", message: "Invalid Admin Token" });
        }
        runGhostShell(config).catch(e => console.error(e));
        return res.json({ status: "success", message: "Bot Started" });
    }
 
    // LOGIC C: Catch-all JSON (Prevents the "<" error)
    return res.json({ 
        status: "online", 
        message: "Server is active, but license key was missing or invalid." 
    });
};

// 5. Routes - Adding /validate so your app finds the "door" it's looking for
app.all('/', handleRequest);
app.all('/validate', handleRequest); // FIX: Added this route
app.all('/admin/execute', handleRequest);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));