import fetch from 'node-fetch'; // Ensure node-fetch is installed
import fs from 'fs/promises'; // Use the Promises API of fs for async operations
import { JSDOM } from 'jsdom';
// --------------- Basic Params ---------------


// --------------- Fetch HTML ---------------
async function fetch_html(url) {
    try {
        setTimeout(function() {
            console.log(`Fetching ${url}`);
        }, 1000);


        // Get URL HTML
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}


// --------------- Query Google Results ---------------
async function query_google(query, n_articles, n_start) {
    try {
        // Formatting Link For Query
        let url = `https://www.google.com/search?q=${query}&start=${n_start}&num=${n_articles}&tbm=nws`;
        return await fetch_html(url);
    } catch (error) {
        throw error;
    }
}


// --------------- Save OUT ---------------
async function save_out(content, filename) {
    // Saving Content To Text File
    await fs.writeFile(filename, content, { encoding: 'utf8' });
    console.log(`HTML content saved to ${filename}`);
}


// --------------- Extract Links ---------------
async function extract_links(raw_html) {
    // Creating And Populating Virtual DOM
    let dom = new JSDOM(raw_html);
    let document = dom.window.document;
    let html = document.createElement("html");
    html.innerHTML = raw_html;


    // Getting <a> Tags
    let a_tags = html.getElementsByTagName("a");


    // List To Store URLS Found
    let urls = [];


    for (let i=0; i<a_tags.length; i++) {
        // Extracting URLS From href Attribute In <a> Tags
        let link_location = (a_tags[i].getAttribute("href")).indexOf("https");
        if (link_location > -1) {
            urls.push((a_tags[i].getAttribute("href")).slice(link_location));
        }
    }
    return urls;
}


// --------------- Scrape HTML ---------------
async function scrape_html(url) {
    try {
        // Applying Jina Scrape
        let jina_key = "r.jina.ai/";
        let jina_url = url.slice(0,8)+jina_key+url.slice(8);
        console.log('worked');
        let content = await fetch_html(jina_url);


        // Cleaning Scraped Data (Removing Links)
        let next_i = (content.indexOf("[") < content.indexOf("]")) ? content.indexOf("[") : content.indexOf("]");
        while (next_i > -1) {
            let closing_i = content.indexOf(")", next_i);
            if (closing_i === -1) {
                break;
            }
            content = content.slice(0,next_i)+content.slice(closing_i+1);
            next_i = (content.indexOf("[") < content.indexOf("]")) ? content.indexOf("[") : content.indexOf("]");
        }
        return content;
    } catch (error) {
        throw error;
    }
   
}


// --------------- Crawler Object ---------------
class Crawler {
    constructor(url, key_words) {
        this.url = url;
        this.key_words = key_words;
    }


    async crawl() {
        let all_cont = [];
        try {
            let scraped_cont = await scrape_html(this.url);
            console.log(`scraped: ${this.url}`);
            if (this.is_valuable(scraped_cont)) {
                all_cont.push(scraped_cont);
                let urls = await extract_links(fetch_html(this.url));
                if (urls.includes(url)) {
                    return all_cont.flat();
                }
                let more_cont = await Promise.all(urls.map(u => (new Crawler(u)).crawl()));
                all_cont.push(more_cont);
            }
            return all_cont.flat();
        } catch(error) {
            return all_cont.flat();
        }
       
    }


    async is_valuable(content) {
        for (let word of this.key_words) {
            if (content.includes(word)) {
                return true;
            }
        }
        return false;
    }
}


// --------------- Get Data On Query ---------------
async function gather_query_data(query, keywords) {
    let scraped_cont = [];
    let root_urls = [];
    for (let i=0;i<5;i++) {
        root_urls.push(await extract_links(await query_google(query,100,i*100)));
    }
    root_urls = root_urls.flat();
    console.log(root_urls.length);
    let crawled_cont = await Promise.all(root_urls.map(root => (new Crawler(root, keywords)).crawl()));
    return crawled_cont.flat();
}


// Example Usage
// let content = await query_google('ikea is bad', 10, 0);
// content = await extract_links(content);
let url = "https://www.youtube.com/watch?v=Vx1Hk07tgXk";
html = fetch_html(url);
save_out(html, 'test1');
// let crawler_obj = new Crawler(url, ['ikea', 'toilet paper']);
// console.log(crawler_obj.crawl());
// console.log(gather_query_data('ikea is bad', ['ikea']));
// const outputFile = 'nbc.txt'; // Replace with desired file name
// save_out(content, outputFile);
