import {Scheduler, Crawler, save_out, content_to_database, get_google_roots, launch_crawlers, query_google} from './crawler_modules.js'

// --------------- HTML Fetch Unit Test ---------------
async function fetch_unit_test(): Promise<void> {
    let schd = new Scheduler(6000);
    let html = await schd.fetch_html("https://www.apartmenttherapy.com/ikea-trones-shoe-rack-hack-37454121")
    save_out(html, "scraped_content\\test_fetch1.txt");
    Promise.resolve();
}

// --------------- Crawler Unit Test ---------------
async function crawler_unit_test(): Promise<void> {
    let schd = new Scheduler(6000);
    let url = "https://www.yahoo.com/lifestyle/ikea-stall-favorite-way-sneak-015200896.html"
    let crawler = new Crawler(url, ["ikea"], schd, 1);
    let content = await crawler.crawl();
    await content_to_database(content, 'scraped_content\\test_2_results.txt');
    Promise.resolve();
}

// --------------- Query Unit Test ---------------
async function query_unit_test(query: string, keywords: string[]): Promise<void> {
    // Make A Scheduler Object
    let schd = new Scheduler(6000);

    // Get Root URL's
    let root_urls = await get_google_roots('ikea', 2, 10, schd);

    // Launch Crawlers On Roots
    let crawled_cont = await launch_crawlers(root_urls, keywords, schd);

    // Upload To DataBase
    console.log('running');
    console.log(crawled_cont);
    await content_to_database(crawled_cont, 'scraped_content\\test_3_results.txt');
    Promise.resolve();
}

// --------------- Test Runner ---------------
query_unit_test('ikea', ['ikea']);