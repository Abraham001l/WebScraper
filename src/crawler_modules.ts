import axios from 'axios';
import dotenv from 'dotenv';


// Loading Environment Variables
dotenv.config();


class scheduler {
    // Queue System & Proxy Configuration
    private queue: string[];
    private scraped_urls: string[];
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


    async fetch_url(url: string): Promise<string> {
        // Fetching HTML
        const response = await axios.get(url, this.proxy_config)
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
        let html: string;
        html = await this.fetch_url(url);
        return html;
    }


    async get_free_slot(url: string): Promise<void> {
        // Waiting Until Spot In Queue Is Avaliable
        while (this.active_threads>0 && this.queue.indexOf(url)==1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        return Promise.resolve();
    }
}


class crawler {
   
}

async function test(): Promise<void> {
    const schd = new scheduler();
    let html1: string;
    html1 = await schd.request_url("https://www.cnn.com/2023/02/12/sport/gallery/best-photos-super-bowl-lvii/index.html")
    console.log("successful");
}

test();