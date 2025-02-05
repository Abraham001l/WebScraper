import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Array of proxy URLs
const proxies = [
    'http://114.121.248.251:8080',
    'http://222.85.190.32:8090',
    'http://47.107.128.69:888',
    'http://41.65.146.38:8080',
    'http://190.63.184.11:8080',
    'http://45.7.135.34:999',
    'http://141.94.104.25:8080',
    'http://222.74.202.229:8080',
    'http://141.94.106.43:8080',
    'http://191.101.39.96:80'
];

const url = 'https://ipecho.net/plain';

// Iterate through the proxy list
proxies.forEach(proxy => {
    // Set up the proxy agent
    const agent = new HttpsProxyAgent(proxy);

    // Configure axios to use the proxy
    axios.get(url, { httpsAgent: agent })
        .then(response => {
            console.log(`Proxy ${proxy} is working:`, response.data);
        })
        .catch(error => {
            console.log(`Proxy ${proxy} failed:`, error.message);
        });
});
