import axios, { all } from 'axios';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises'; // Use the Promises API of fs for async operations
import { mkConfig, generateCsv, download } from "export-to-csv";

// Loading Environment Variables
dotenv.config();

// --------------- Scheduler Class ---------------
export class Scheduler {
    // Queue System & Proxy Configuration
    private queue: string[];
    public scraped_urls: string[];
    public active_threads: number;
    public id: number;
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


    constructor(id:number) {
        this.queue = [];
        this.scraped_urls = [];
        this.active_threads = 0;
        this.id = id;
    }


    async fetch_html(url: string): Promise<string> {
        // Fetching HTML
        this.wait(2000);
        const response = await axios.get(url, this.proxy_config);
        console.log(`fetched: ${url}`)
        return response.data;
    }


    async request_url(url: string): Promise<string> {
        // Printing Scheduler ID
        console.log(this.id);

        // Add Url To Urls Visited & Queue
        this.scraped_urls.push(url);
        this.queue.push(url);

        // Wait For Free Slot
        await this.get_free_slot(url);
        console.log(url);

        // Update Active Thread & Remove From Queue
        this.active_threads++;
        this.queue.splice(1,1);

        // Try To Get HTML
        let html = await this.fetch_html(url);
        return html;
    }


    async get_free_slot(url: string): Promise<void> {
        // Waiting Until Spot In Queue Is Avaliable
        while (this.active_threads>0 && this.queue.indexOf(url)==0) {
            this.wait(1000);
        }
        console.log(this.queue.indexOf(url));
        return Promise.resolve();
    }

    async wait(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
        return Promise.resolve();
    }
}

// --------------- Crawler Class ---------------
export class Crawler {
    public url: string;
    public key_words: string[];
    private schd: Scheduler;
    private generation: number;

    constructor(url: string, key_words: string[], schd: Scheduler, generation: number) {
        this.url = url;
        this.key_words = key_words;
        this.schd = schd;
        this.generation = generation;
    }

    async crawl(): Promise<any[]> {
        // String List To Store All Content From Crawler And Children
        let crawled_cont: any[];
        crawled_cont = [];

        // Attempting To Get HTML
        let html:string;
        try {
            html = await this.schd.fetch_html(this.url);
        } catch (e) {
            return crawled_cont.flat();
        }

        // Checking If HTML Is Valuable
        if (!this.is_valuable(html)) {
            return crawled_cont.flat();
        }

        // Get Text From HTMl & Add To Content(TODO)
        crawled_cont.push({url: this.url});

        // Checking Generation
        let generation_limit = 3;
        if (this.generation >= 3) {
            return crawled_cont.flat();
        }

        // Getting Possible Link Branches & Purging Invalid Ones
        let urls = await extract_links(html);
        urls = this.purge_visited_urls(urls);

        // Exploring Link Branches
        let branch_cont = await Promise.all(urls.map(u => (new Crawler(u, this.key_words, this.schd, this.generation++)).crawl()));
        crawled_cont.push(...branch_cont.flat());

        // Removing Empty Data
        crawled_cont.flat()
        crawled_cont = crawled_cont.filter(function (c) {
            return c;
        })

        return crawled_cont;
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
export async function extract_links(raw_html: string): Promise<string[]> {
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
                let url = href.slice(link_location);
                if (!url.includes('google.com')) {
                    urls.push(url);
                }
            }
        }
    }
    return urls;
}

// --------------- Query Google Results ---------------
export async function query_google(query: string, n_articles: number, n_start: number, schd: Scheduler): Promise<string> {
    // Formatting Link For Query
    let url = `https://www.google.com/search?q=${query}&start=${n_start}&num=${n_articles}&tbm=nws&hl=en&lr=en`;
    return await schd.fetch_html(url);
}

// --------------- Save OUT ---------------
export async function save_out(content: string, filename:string) {
    // Saving Content To Text File
    await fs.writeFile(filename, content, { encoding: 'utf8' });
    console.log(`HTML content saved to ${filename}`);
}

// --------------- Inserting Content Into Database ---------------
export async function content_to_database(crawled_content: any[], filename: string) {
    let csv_config = mkConfig({useKeysAsHeaders: true})
    const csv = generateCsv(csv_config)(crawled_content);
    await fs.writeFile(filename, csv.toString(), {encoding: "utf8"})
    console.log(`CSV content saved to ${filename}`);
}

// --------------- Get Google Root URL's ---------------
export async function get_google_roots(query: string, n_rounds: number, round_size: number, schd: Scheduler): Promise<string[]> {
    let root_urls: string[];
    root_urls = [];

    // Gathering Root Urls
    for (let i=0;i<n_rounds;i++) {
        let google_html = await query_google(query,round_size,i*round_size, schd);
        root_urls.push(...(await extract_links(google_html)).flat());
    }
    return root_urls.flat();
}

// --------------- Launch Crawler On Root URL's ---------------
export async function launch_crawlers(root_urls: string[], keywords: string[], schd: Scheduler): Promise<any[]> {
    // Launching Crawlers On Root Links
    let crawled_cont = await Promise.all(root_urls.map(root => (new Crawler(root, keywords, schd, 1)).crawl()));
    return crawled_cont.flat();
}

// --------------- Initialize Crawl On Google Query Origin ---------------
export async function crawl_origin(query: string, keywords: string[]): Promise<void> {
    let scraped_cont: string[];
    scraped_cont = [];
    let root_urls: string[];
    root_urls = [];
    let schd = new Scheduler(12345);

    for (let i=0;i<1;i++) {
        let google_html = await query_google(query,10,i*10, schd);
        await save_out(google_html, 'test1.txt');
        root_urls.push(...(await extract_links(google_html)).flat());
    }
    root_urls = root_urls.flat();
    console.log(root_urls);
    console.log("wait 2 secs");
    await new Promise(resolve => setTimeout(resolve, 2000));
    let crawled_cont = await Promise.all(root_urls.map(root => (new Crawler(root, keywords, schd, 1)).crawl()));

    // return crawled_cont.flat();
    return Promise.resolve();
}


async function test(): Promise<void> {
    await crawl_origin("ikea is bad", ["ikea"]);
    return Promise.resolve();
}