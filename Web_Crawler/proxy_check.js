const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

async function checkProxy(proxy) {
    const targetUrl = 'https://httpbin.org/ip'; // This returns your IP in JSON
    const agent = new HttpsProxyAgent(proxy);

    try {
        const response = await fetch(targetUrl, { agent, timeout: 5000 });
        if (!response.ok) throw new Error(`HTTP Status: ${response.status}`);
        
        const data = await response.json();
        console.log(`Proxy ${proxy} is working! Your IP:`, data.origin);
    } catch (error) {
        console.log(`Proxy ${proxy} failed:`, error.message);
    }
}

// Example usage
const proxy = 'http://123.456.789.012:8080'; // Replace with an actual proxy
checkProxy(proxy);
