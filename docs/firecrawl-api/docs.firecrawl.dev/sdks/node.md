[Firecrawl Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo.png)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo-dark.png)](https://firecrawl.dev/)

v1

Search...

Ctrl KAsk AI

Search...

Navigation

Official

Node

[Documentation](../introduction.md)
[SDKs](overview.md)
[Learn](https://www.firecrawl.dev/blog/category/tutorials)
[Integrations](https://www.firecrawl.dev/app)
[API Reference](../api-reference/introduction.md)

[​](node.md#installation)

Installation
----------------------------------------------------------------------

To install the Firecrawl Node SDK, you can use npm:

Node

Copy

    npm install @mendable/firecrawl-js

[​](node.md#usage)

Usage
--------------------------------------------------------

1.  Get an API key from [firecrawl.dev](https://firecrawl.dev/)
    
2.  Set the API key as an environment variable named `FIRECRAWL_API_KEY` or pass it as a parameter to the `FirecrawlApp` class.

Here’s an example of how to use the SDK with error handling:

Node

Copy

    import FirecrawlApp, { CrawlParams, CrawlStatusResponse } from '@mendable/firecrawl-js';
    
    const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});
    
    // Scrape a website
    const scrapeResponse = await app.scrapeUrl('https://firecrawl.dev', {
      formats: ['markdown', 'html'],
    });
    
    if (!scrapeResponse.success) {
      throw new Error(`Failed to scrape: ${scrapeResponse.error}`)
    }
    
    console.log(scrapeResponse)
    
    // Crawl a website
    const crawlResponse = await app.crawlUrl('https://firecrawl.dev', {
      limit: 100,
      scrapeOptions: {
        formats: ['markdown', 'html'],
      }
    });
    
    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.error}`)
    }
    
    console.log(crawlResponse)

### 

[​](node.md#scraping-a-url)

Scraping a URL

To scrape a single URL with error handling, use the `scrapeUrl` method. It takes the URL as a parameter and returns the scraped data as a dictionary.

Node

Copy

    // Scrape a website:
    const scrapeResult = await app.scrapeUrl('firecrawl.dev', { formats: ['markdown', 'html'] });
    
    if (!scrapeResult.success) {
      throw new Error(`Failed to scrape: ${scrapeResult.error}`)
    }
    
    console.log(scrapeResult)

### 

[​](node.md#crawling-a-website)

Crawling a Website

To crawl a website with error handling, use the `crawlUrl` method. It takes the starting URL and optional parameters as arguments. The `params` argument allows you to specify additional options for the crawl job, such as the maximum number of pages to crawl, allowed domains, and the output format.

Node

Copy

    const crawlResponse = await app.crawlUrl('https://firecrawl.dev', {
      limit: 100,
      scrapeOptions: {
        formats: ['markdown', 'html'],
      }
    })
    
    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.error}`)
    }
    
    console.log(crawlResponse)

### 

[​](node.md#asynchronous-crawling)

Asynchronous Crawling

To crawl a website asynchronously, use the `crawlUrlAsync` method. It returns the crawl `ID` which you can use to check the status of the crawl job. It takes the starting URL and optional parameters as arguments. The `params` argument allows you to specify additional options for the crawl job, such as the maximum number of pages to crawl, allowed domains, and the output format.

Node

Copy

    const crawlResponse = await app.asyncCrawlUrl('https://firecrawl.dev', {
      limit: 100,
      scrapeOptions: {
        formats: ['markdown', 'html'],
      }
    });
    
    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.error}`)
    }
    
    console.log(crawlResponse)

### 

[​](node.md#checking-crawl-status)

Checking Crawl Status

To check the status of a crawl job with error handling, use the `checkCrawlStatus` method. It takes the `ID` as a parameter and returns the current status of the crawl job.

Node

Copy

    const crawlResponse = await app.checkCrawlStatus("<crawl_id>");
    
    if (!crawlResponse.success) {
      throw new Error(`Failed to check crawl status: ${crawlResponse.error}`)
    }
    
    console.log(crawlResponse)

### 

[​](node.md#cancelling-a-crawl)

Cancelling a Crawl

To cancel an asynchronous crawl job, use the `cancelCrawl` method. It takes the job ID of the asynchronous crawl as a parameter and returns the cancellation status.

Node

Copy

    const cancelCrawl = await app.cancelCrawl(id);
    console.log(cancelCrawl)

### 

[​](node.md#mapping-a-website)

Mapping a Website

To map a website with error handling, use the `mapUrl` method. It takes the starting URL as a parameter and returns the mapped data as a dictionary.

Node

Copy

    const mapResult = await app.mapUrl('https://firecrawl.dev');
    
    if (!mapResult.success) {
      throw new Error(`Failed to map: ${mapResult.error}`)
    }
    
    console.log(mapResult)

### 

[​](node.md#crawling-a-website-with-websockets)

Crawling a Website with WebSockets

To crawl a website with WebSockets, use the `crawlUrlAndWatch` method. It takes the starting URL and optional parameters as arguments. The `params` argument allows you to specify additional options for the crawl job, such as the maximum number of pages to crawl, allowed domains, and the output format.

Node

Copy

    const watch = await app.crawlUrlAndWatch('mendable.ai', { excludePaths: ['blog/*'], limit: 5});
    
    watch.addEventListener("document", doc => {
      console.log("DOC", doc.detail);
    });
    
    watch.addEventListener("error", err => {
      console.error("ERR", err.detail.error);
    });
    
    watch.addEventListener("done", state => {
      console.log("DONE", state.detail.status);
    });

[​](node.md#error-handling)

Error Handling
--------------------------------------------------------------------------

The SDK handles errors returned by the Firecrawl API and raises appropriate exceptions. If an error occurs during a request, an exception will be raised with a descriptive error message. The examples above demonstrate how to handle these errors using `try/catch` blocks.

[Suggest edits](https://github.com/mendableai/firecrawl-docs/edit/main/sdks/node.mdx)
[Raise issue](https://github.com/mendableai/firecrawl-docs/issues/new?title=Issue%20on%20docs&body=Path:%20/sdks/node)

[Python](python.md)
[Go](go.md)

On this page

*   [Installation](node.md#installation)
    
*   [Usage](node.md#usage)
    
*   [Scraping a URL](node.md#scraping-a-url)
    
*   [Crawling a Website](node.md#crawling-a-website)
    
*   [Asynchronous Crawling](node.md#asynchronous-crawling)
    
*   [Checking Crawl Status](node.md#checking-crawl-status)
    
*   [Cancelling a Crawl](node.md#cancelling-a-crawl)
    
*   [Mapping a Website](node.md#mapping-a-website)
    
*   [Crawling a Website with WebSockets](node.md#crawling-a-website-with-websockets)
    
*   [Error Handling](node.md#error-handling)
    

Assistant

Responses are generated using AI and may contain mistakes.