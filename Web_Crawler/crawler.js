import fetch from 'node-fetch'; // Ensure node-fetch is installed
import fs from 'fs/promises'; // Use the Promises API of fs for async operations
import { JSDOM } from 'jsdom';
// --------------- Basic Params ---------------

// --------------- Fetch HTML --------------- 
async function fetch_html(url) {
    try {
        // Get URL HTML
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching or saving HTML: ${error.message}`);
        throw error;
    }
}

// --------------- Query Google Results ---------------
async function query_google(query, n_articles, n_start) {
    let url = `https://www.google.com/search?q=${query}&start=${n_start}&num=${n_articles}&tbm=nws`;
    return await fetch_html(url);
}

// --------------- Save OUT ---------------
async function save_out(content, filename) {
    await fs.writeFile(filename, content, { encoding: 'utf8' });
    console.log(`HTML content saved to ${filename}`);
}

// --------------- Extract Links ---------------
async function extract_links(content) {
    let dom = new JSDOM(content);
    let document = dom.window.document;
    let html = document.createElement("html");
    html.innerHTML = content;
    let a_tags = html.getElementsByTagName("a");
    let urls = [];

    for (let i=0; i<a_tags.length; i++) {
        let link_location = (a_tags[i].getAttribute("href")).indexOf("https");
        if (link_location > -1) {
            urls.push((a_tags[i].getAttribute("href")).slice(link_location));
        }
    }
    return urls
}



// Example Usage
let content = await query_google('ikea is bad', 10, 0);
content = await extract_links(content)
const outputFile = 'links.txt'; // Replace with desired file name
save_out(content, outputFile)

