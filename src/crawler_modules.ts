import axios, { all } from 'axios';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom';

// Loading Environment Variables
dotenv.config();

// --------------- Scheduler Class ---------------
class Scheduler {
    // Queue System & Proxy Configuration
    private queue: string[];
    public scraped_urls: string[];
    public active_threads: number;
    private proxy_config = {
        proxy: {
            host: process.env.PROXY_HOST ?? "",
            port: parseInt(process.env.PROXY_PORT ?? '0', 10),
            auth: {
              username: process.env.USERNAME ?? "",
              password: process.env.API_KEY ?? ""  
            },
            protocol: 'http'
          }
    }


    constructor() {
        this.queue = [];
        this.scraped_urls = [];
        this.active_threads = 0;
    }


    async fetch_html(url: string): Promise<string> {
        // Fetching HTML
        this.wait(1000);
        const response = await axios.get(url, this.proxy_config);
        return response.data;
    }


    async request_url(url: string): Promise<string> {
        // Add Url To Urls Visited & Queue
        this.scraped_urls.push(url);
        this.queue.push(url);

        // Wait For Free Slot
        await this.get_free_slot(url);

        // Update Active Thread & Remove From Queue
        this.active_threads++;
        this.queue.splice(1,1);

        // Try To Get HTML
        let html = await this.fetch_html(url);
        return html;
    }


    async get_free_slot(url: string): Promise<void> {
        // Waiting Until Spot In Queue Is Avaliable
        while (this.active_threads>0 && this.queue.indexOf(url)==1) {
            this.wait(1000);
        }
        return Promise.resolve();
    }

    async wait(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
        console.log(`waited ${ms} milliseconds`);
        return Promise.resolve();
    }
}

// --------------- Crawler Class ---------------
class Crawler {
    public url: string;
    public key_words: string[];
    private schd: Scheduler;

    constructor(url: string, key_words: string[], schd: Scheduler) {
        this.url = url;
        this.key_words = key_words;
        this.schd = schd;
    }

    async crawl(): Promise<string[]> {
        // String List To Store All Content From Crawler And Children
        let all_cont: string[];
        all_cont = [];

        // Attempting To Get HTML
        let html:string;
        try {
            html = await this.schd.fetch_html(this.url);
        } catch (e) {
            return all_cont.flat();
        }

        // Checking If HTML Is Valuable
        if (!this.is_valuable(html)) {
            return all_cont.flat();
        }

        // Get Text From HTMl (TODO)

        // Getting Possible Link Branches & Purging Invalid Ones
        let urls = await extract_links(html);
        urls = this.purge_visited_urls(urls);

        // Exploring Link Branches
        let branch_cont = await Promise.all(urls.map(u => (new Crawler(u, this.key_words, this.schd)).crawl()));
        all_cont.push(...branch_cont.flat());
        return all_cont.flat()
    }

    is_valuable(html: string) {
        // Checks If Any Keywords Are Present
        for (let word of this.key_words) {
            if (html.includes(word)) {
                return true;
            }
        }
        return false;
    }

    purge_visited_urls(urls: string[]): string[] {
        // List To Store Valid URL AKA URLs Not Visited Yet
        let valid_urls: string[];
        valid_urls = [];

        // Purging Invalid URLs
        for (let url of urls) {
            if (!this.schd.scraped_urls.includes(url)) {
                valid_urls.push(url);
            }
        }

        return valid_urls;
    }
}

// --------------- Link Extraction Method ---------------
async function extract_links(raw_html: string): Promise<string[]> {
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
        let href = a_tags[i].getAttribute("href");
        if (href) {
            let link_location = href.indexOf("https");
            if (link_location > -1) {
                urls.push(href.slice(link_location));
            }
        }
    }
    return urls;
}

// --------------- Query Google Results ---------------
async function query_google(query: string, n_articles: number, n_start: number, schd: Scheduler) {
    // Formatting Link For Query
    let url = `https://www.google.com/search?q=${query}&start=${n_start}&num=${n_articles}&tbm=nws`;
    return await schd.fetch_html(url);
}

async function test(): Promise<void> {
    const schd = new Scheduler();
    let html1: string;
    html1 = await schd.request_url("https://www.cnn.com/2023/02/12/sport/gallery/best-photos-super-bowl-lvii/index.html")
    console.log("successful");
}

test();