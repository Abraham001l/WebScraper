import {Scheduler, Crawler, save_out, content_to_database, get_google_roots, launch_crawlers, query_google} from './crawler_modules.js'

// --------------- HTML Fetch Unit Test ---------------
async function fetch_unit_test(url: string, filename: string): Promise<void> {
    // Create Scheduler And Fetch HTML
    let schd = new Scheduler(6000);
    let html = await schd.fetch_html(url)

    // Save HTML To File
    save_out(html, filename);
    Promise.resolve();
}

// --------------- HTML Forum Fetch Unit Test ---------------
async function fetch_forum_unit_test(url: string, filename: string): Promise<void> {
    // Create Scheduler And Fetch HTML
    let schd = new Scheduler(6000);
    // Example usage
    schd.fetch_forum(url)
    .then(html => save_out(html, filename))
    .catch(error => console.error('Error fetching page:', error));

    // Save HTML To File
    // save_out(html, filename);
    Promise.resolve();
}



// --------------- Crawler Unit Test ---------------
async function crawler_unit_test(url: string, filename: string): Promise<void> {
    // Create Scheduler And Crawler
    let schd = new Scheduler(6000);
    let crawler = new Crawler(url, ["ikea"], schd, 1);

    // Crawl Page 
    let content = await crawler.crawl();

    // Save Crawled Content To File
    await content_to_database(content, filename);
    Promise.resolve();
}

// --------------- Query Unit Test ---------------
async function query_unit_test(query: string, keywords: string[], filename: string): Promise<void> {
    // Make A Scheduler Object
    let schd = new Scheduler(6000);

    // Get Root URL's
    let root_urls = await get_google_roots('ikea', 2, 2, schd);
    console.log(root_urls)

    // Launch Crawlers On Roots
    let crawled_cont = await launch_crawlers(root_urls, keywords, schd);

    // Upload To DataBase
    console.log(crawled_cont);
    await content_to_database(crawled_cont, filename);
    Promise.resolve();
}

// --------------- Test Runner ---------------
fetch_forum_unit_test("https://www.reddit.com/r/NoStupidQuestions/comments/17ztgr0/what_is_the_most_downvoted_post_on_reddit/", "scraped_content\\test_6_forum.txt")