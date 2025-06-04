[Firecrawl Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo.png)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo-dark.png)](https://firecrawl.dev/)

v1

Search...

Ctrl KAsk AI

Search...

Navigation

Get Started

Quickstart

[Documentation](../../introduction.md)
[SDKs](../../sdks/overview.md)
[Learn](https://www.firecrawl.dev/blog/category/tutorials)
[Integrations](https://www.firecrawl.dev/app)
[API Reference](../../api-reference/introduction.md)

![Hero Light](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/images/turn-websites-into-llm-ready-data--firecrawl.jpg)

[​](node.md#welcome-to-firecrawl)

Welcome to Firecrawl
-----------------------------------------------------------------------------------------

[Firecrawl](https://firecrawl.dev/?ref=github)
 is an API service that takes a URL, crawls it, and converts it into clean markdown. We crawl all accessible subpages and give you clean markdown for each. No sitemap required.

[​](node.md#how-to-use-it%3F)

How to use it?
-------------------------------------------------------------------------------

We provide an easy to use API with our hosted version. You can find the playground and documentation [here](https://firecrawl.dev/playground)
. You can also self host the backend if you’d like.

Check out the following resources to get started:

*   [x]  **API**: [Documentation](../../api-reference/introduction.md)
    
*   [x]  **SDKs**: [Python](../../sdks/python.md)
    , [Node](../../sdks/node.md)
    , [Go](../../sdks/go.md)
    , [Rust](../../sdks/rust.md)
    
*   [x]  **LLM Frameworks**: [Langchain (python)](https://python.langchain.com/docs/integrations/document_loaders/firecrawl/)
    , [Langchain (js)](https://js.langchain.com/docs/integrations/document_loaders/web_loaders/firecrawl)
    , [Llama Index](https://docs.llamaindex.ai/en/latest/examples/data_connectors/WebPageDemo/#using-firecrawl-reader)
    , [Crew.ai](https://docs.crewai.com/)
    , [Composio](https://composio.dev/tools/firecrawl/all)
    , [PraisonAI](https://docs.praison.ai/firecrawl/)
    , [Superinterface](https://superinterface.ai/docs/assistants/functions/firecrawl)
    , [Vectorize](https://docs.vectorize.io/integrations/source-connectors/firecrawl)
    
*   [x]  **Low-code Frameworks**: [Dify](https://dify.ai/blog/dify-ai-blog-integrated-with-firecrawl)
    , [Langflow](https://docs.langflow.org/)
    , [Flowise AI](https://docs.flowiseai.com/integrations/langchain/document-loaders/firecrawl)
    , [Cargo](https://docs.getcargo.io/integration/firecrawl)
    , [Pipedream](https://pipedream.com/apps/firecrawl/)
    
*   [x]  **Others**: [Zapier](https://zapier.com/apps/firecrawl/integrations)
    , [Pabbly Connect](https://www.pabbly.com/connect/integrations/firecrawl/)
    
*   [ ]  Want an SDK or Integration? Let us know by opening an issue.

**Self-host:** To self-host refer to guide [here](../../contributing/self-host.md)
.

### 

[​](node.md#api-key)

API Key

To use the API, you need to sign up on [Firecrawl](https://firecrawl.dev/)
 and get an API key.

### 

[​](node.md#features)

Features

*   [**Scrape**](../../introduction.md#scraping)
    : scrapes a URL and get its content in LLM-ready format (markdown, structured data via [LLM Extract](../../introduction.md#extraction)
    , screenshot, html)
*   [**Crawl**](../../introduction.md#crawling)
    : scrapes all the URLs of a web page and return content in LLM-ready format
*   [**Map**](../../features/map.md)
    : input a website and get all the website urls - extremely fast
*   [**Search**](../../features/search.md)
    : search the web and get full content from results
*   [**Extract**](../../features/extract.md)
    : get structured data from single page, multiple pages or entire websites with AI.

### 

[​](node.md#powerful-capabilities)

Powerful Capabilities

*   **LLM-ready formats**: markdown, structured data, screenshot, HTML, links, metadata
*   **The hard stuff**: proxies, anti-bot mechanisms, dynamic content (js-rendered), output parsing, orchestration
*   **Customizability**: exclude tags, crawl behind auth walls with custom headers, max crawl depth, etc…
*   **Media parsing**: pdfs, docx, images.
*   **Reliability first**: designed to get the data you need - no matter how hard it is.
*   **Actions**: click, scroll, input, wait and more before extracting data

You can find all of Firecrawl’s capabilities and how to use them in our [documentation](../../index.md)

[​](node.md#installing-firecrawl)

Installing Firecrawl
-----------------------------------------------------------------------------------------

Python

Node

Go

Rust

Copy

    pip install firecrawl-py

[​](node.md#scraping)

Scraping
-----------------------------------------------------------------

To scrape a single URL, use the `scrape_url` method. It takes the URL as a parameter and returns the scraped data as a dictionary.

Python

Node

Go

Rust

cURL

Copy

    from firecrawl import FirecrawlApp
    
    app = FirecrawlApp(api_key="fc-YOUR_API_KEY")
    
    # Scrape a website:
    scrape_result = app.scrape_url('firecrawl.dev', formats=['markdown', 'html'])
    print(scrape_result)

### 

[​](node.md#response)

Response

SDKs will return the data object directly. cURL will return the payload exactly as shown below.

Copy

    {
      "success": true,
      "data" : {
        "markdown": "Launch Week I is here! [See our Day 2 Release 🚀](https://www.firecrawl.dev/blog/launch-week-i-day-2-doubled-rate-limits)[💥 Get 2 months free...",\
        "html": "<!DOCTYPE html><html lang=\"en\" class=\"light\" style=\"color-scheme: light;\"><body class=\"__variable_36bd41 __variable_d7dc5d font-inter ...",\
        "metadata": {\
          "title": "Home - Firecrawl",\
          "description": "Firecrawl crawls and converts any website into clean markdown.",\
          "language": "en",\
          "keywords": "Firecrawl,Markdown,Data,Mendable,Langchain",\
          "robots": "follow, index",\
          "ogTitle": "Firecrawl",\
          "ogDescription": "Turn any website into LLM-ready data.",\
          "ogUrl": "https://www.firecrawl.dev/",\
          "ogImage": "https://www.firecrawl.dev/og.png?123",\
          "ogLocaleAlternate": [],\
          "ogSiteName": "Firecrawl",\
          "sourceURL": "https://firecrawl.dev",\
          "statusCode": 200\
        }\
      }\
    }\
\
[​](node.md#crawling)\
\
Crawling\
-----------------------------------------------------------------\
\
Used to crawl a URL and all accessible subpages. This submits a crawl job and returns a job ID to check the status of the crawl.\
\
### \
\
[​](node.md#usage)\
\
Usage\
\
Python\
\
Node\
\
Go\
\
Rust\
\
cURL\
\
Copy\
\
    from firecrawl import FirecrawlApp, ScrapeOptions\
    \
    app = FirecrawlApp(api_key="fc-YOUR_API_KEY")\
    \
    # Crawl a website:\
    crawl_result = app.crawl_url(\
      'https://firecrawl.dev', \
      limit=10, \
      scrape_options=ScrapeOptions(formats=['markdown', 'html']),\
    )\
    print(crawl_result)\
\
If you’re using cURL or `async crawl` functions on SDKs, this will return an `ID` where you can use to check the status of the crawl.\
\
Copy\
\
    {\
      "success": true,\
      "id": "123-456-789",\
      "url": "https://api.firecrawl.dev/v1/crawl/123-456-789"\
    }\
\
### \
\
[​](node.md#check-crawl-job)\
\
Check Crawl Job\
\
Used to check the status of a crawl job and get its result.\
\
Python\
\
Node\
\
Go\
\
Rust\
\
cURL\
\
Copy\
\
    crawl_status = app.check_crawl_status("<crawl_id>")\
    print(crawl_status)\
\
#### \
\
[​](node.md#response-2)\
\
Response\
\
The response will be different depending on the status of the crawl. For not completed or large responses exceeding 10MB, a `next` URL parameter is provided. You must request this URL to retrieve the next 10MB of data. If the `next` parameter is absent, it indicates the end of the crawl data.\
\
Scraping\
\
Completed\
\
Copy\
\
    {\
      "status": "scraping",\
      "total": 36,\
      "completed": 10,\
      "creditsUsed": 10,\
      "expiresAt": "2024-00-00T00:00:00.000Z",\
      "next": "https://api.firecrawl.dev/v1/crawl/123-456-789?skip=10",\
      "data": [\
        {\
          "markdown": "[Firecrawl Docs home page![light logo](https://mintlify.s3-us-west-1.amazonaws.com/firecrawl/logo/light.svg)!...",\
          "html": "<!DOCTYPE html><html lang=\"en\" class=\"js-focus-visible lg:[--scroll-mt:9.5rem]\" data-js-focus-visible=\"\">...",\
          "metadata": {\
            "title": "Build a 'Chat with website' using Groq Llama 3 | Firecrawl",\
            "language": "en",\
            "sourceURL": "https://docs.firecrawl.dev/learn/rag-llama3",\
            "description": "Learn how to use Firecrawl, Groq Llama 3, and Langchain to build a 'Chat with your website' bot.",\
            "ogLocaleAlternate": [],\
            "statusCode": 200\
          }\
        },\
        ...\
      ]\
    }\
\
[​](node.md#extraction)\
\
Extraction\
---------------------------------------------------------------------\
\
With LLM extraction, you can easily extract structured data from any URL. We support pydantic schemas to make it easier for you too. Here is how you to use it:\
\
v1 is only supported on node, python and cURL at this time.\
\
Python\
\
Node\
\
cURL\
\
Copy\
\
    from firecrawl import FirecrawlApp, JsonConfig\
    from pydantic import BaseModel, Field\
    \
    # Initialize the FirecrawlApp with your API key\
    app = FirecrawlApp(api_key='your_api_key')\
    \
    class ExtractSchema(BaseModel):\
        company_mission: str\
        supports_sso: bool\
        is_open_source: bool\
        is_in_yc: bool\
    \
    json_config = JsonConfig(\
        extractionSchema=ExtractSchema.model_json_schema(),\
        mode="llm-extraction",\
        pageOptions={"onlyMainContent": True}\
    )\
    \
    llm_extraction_result = app.scrape_url(\
        'https://firecrawl.dev',\
        formats=["json"],\
        json_options=json_config\
    )\
    print(llm_extraction_result)\
\
Output:\
\
JSON\
\
Copy\
\
    {\
        "success": true,\
        "data": {\
          "json": {\
            "company_mission": "AI-powered web scraping and data extraction",\
            "supports_sso": true,\
            "is_open_source": true,\
            "is_in_yc": true\
          },\
          "metadata": {\
            "title": "Firecrawl",\
            "description": "AI-powered web scraping and data extraction",\
            "robots": "follow, index",\
            "ogTitle": "Firecrawl",\
            "ogDescription": "AI-powered web scraping and data extraction",\
            "ogUrl": "https://firecrawl.dev/",\
            "ogImage": "https://firecrawl.dev/og.png",\
            "ogLocaleAlternate": [],\
            "ogSiteName": "Firecrawl",\
            "sourceURL": "https://firecrawl.dev/"\
          },\
        }\
    }\
\
### \
\
[​](node.md#extracting-without-schema-new)\
\
Extracting without schema (New)\
\
You can now extract without a schema by just passing a `prompt` to the endpoint. The llm chooses the structure of the data.\
\
cURL\
\
Copy\
\
    curl -X POST https://api.firecrawl.dev/v1/scrape \\
        -H 'Content-Type: application/json' \\
        -H 'Authorization: Bearer YOUR_API_KEY' \\
        -d '{\
          "url": "https://docs.firecrawl.dev/",\
          "formats": ["json"],\
          "jsonOptions": {\
            "prompt": "Extract the company mission from the page."\
          }\
        }'\
\
Output:\
\
JSON\
\
Copy\
\
    {\
        "success": true,\
        "data": {\
          "json": {\
            "company_mission": "AI-powered web scraping and data extraction",\
          },\
          "metadata": {\
            "title": "Firecrawl",\
            "description": "AI-powered web scraping and data extraction",\
            "robots": "follow, index",\
            "ogTitle": "Firecrawl",\
            "ogDescription": "AI-powered web scraping and data extraction",\
            "ogUrl": "https://firecrawl.dev/",\
            "ogImage": "https://firecrawl.dev/og.png",\
            "ogLocaleAlternate": [],\
            "ogSiteName": "Firecrawl",\
            "sourceURL": "https://firecrawl.dev/"\
          },\
        }\
    }\
\
[​](node.md#interacting-with-the-page-with-actions)\
\
Interacting with the page with Actions\
-----------------------------------------------------------------------------------------------------------------------------\
\
Firecrawl allows you to perform various actions on a web page before scraping its content. This is particularly useful for interacting with dynamic content, navigating through pages, or accessing content that requires user interaction.\
\
Here is an example of how to use actions to navigate to google.com, search for Firecrawl, click on the first result, and take a screenshot.\
\
It is important to almost always use the `wait` action before/after executing other actions to give enough time for the page to load.\
\
### \
\
[​](node.md#example)\
\
Example\
\
Python\
\
Node\
\
cURL\
\
Copy\
\
    from firecrawl import FirecrawlApp\
    \
    app = FirecrawlApp(api_key="fc-YOUR_API_KEY")\
    \
    # Scrape a website:\
    scrape_result = app.scrape_url('firecrawl.dev', \
        formats=['markdown', 'html'], \
        actions=[\
            {"type": "wait", "milliseconds": 2000},\
            {"type": "click", "selector": "textarea[title=\"Search\"]"},\
            {"type": "wait", "milliseconds": 2000},\
            {"type": "write", "text": "firecrawl"},\
            {"type": "wait", "milliseconds": 2000},\
            {"type": "press", "key": "ENTER"},\
            {"type": "wait", "milliseconds": 3000},\
            {"type": "click", "selector": "h3"},\
            {"type": "wait", "milliseconds": 3000},\
            {"type": "scrape"},\
            {"type": "screenshot"}\
        ]\
    )\
    print(scrape_result)\
\
### \
\
[​](node.md#output)\
\
Output\
\
JSON\
\
Copy\
\
    {\
      "success": true,\
      "data": {\
        "markdown": "Our first Launch Week is over! [See the recap 🚀](blog/firecrawl-launch-week-1-recap.md)...",\
        "actions": {\
          "screenshots": [\
            "https://alttmdsdujxrfnakrkyi.supabase.co/storage/v1/object/public/media/screenshot-75ef2d87-31e0-4349-a478-fb432a29e241.png"\
          ],\
          "scrapes": [\
            {\
              "url": "https://www.firecrawl.dev/",\
              "html": "<html><body><h1>Firecrawl</h1></body></html>"\
            }\
          ]\
        },\
        "metadata": {\
          "title": "Home - Firecrawl",\
          "description": "Firecrawl crawls and converts any website into clean markdown.",\
          "language": "en",\
          "keywords": "Firecrawl,Markdown,Data,Mendable,Langchain",\
          "robots": "follow, index",\
          "ogTitle": "Firecrawl",\
          "ogDescription": "Turn any website into LLM-ready data.",\
          "ogUrl": "https://www.firecrawl.dev/",\
          "ogImage": "https://www.firecrawl.dev/og.png?123",\
          "ogLocaleAlternate": [],\
          "ogSiteName": "Firecrawl",\
          "sourceURL": "http://google.com",\
          "statusCode": 200\
        }\
      }\
    }\
\
[​](node.md#open-source-vs-cloud)\
\
Open Source vs Cloud\
-----------------------------------------------------------------------------------------\
\
Firecrawl is open source available under the [AGPL-3.0 license](https://github.com/mendableai/firecrawl/blob/main/LICENSE)\
.\
\
To deliver the best possible product, we offer a hosted version of Firecrawl alongside our open-source offering. The cloud solution allows us to continuously innovate and maintain a high-quality, sustainable service for all users.\
\
Firecrawl Cloud is available at [firecrawl.dev](https://firecrawl.dev/)\
 and offers a range of features that are not available in the open source version:\
\
![Firecrawl Cloud vs Open Source](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/images/open-source-cloud.png)\
\
[​](node.md#contributing)\
\
Contributing\
-------------------------------------------------------------------------\
\
We love contributions! Please read our [contributing guide](https://github.com/mendableai/firecrawl/blob/main/CONTRIBUTING.md)\
 before submitting a pull request.\
\
[Suggest edits](https://github.com/mendableai/firecrawl-docs/edit/main/introduction.mdx)\
[Raise issue](https://github.com/mendableai/firecrawl-docs/issues/new?title=Issue%20on%20docs&body=Path:%20/introduction)\
\
[MCP Server](../../mcp.md)\
\
On this page\
\
*   [Welcome to Firecrawl](node.md#welcome-to-firecrawl)\
    \
*   [How to use it?](node.md#how-to-use-it%3F)\
    \
*   [API Key](node.md#api-key)\
    \
*   [Features](node.md#features)\
    \
*   [Powerful Capabilities](node.md#powerful-capabilities)\
    \
*   [Installing Firecrawl](node.md#installing-firecrawl)\
    \
*   [Scraping](node.md#scraping)\
    \
*   [Response](node.md#response)\
    \
*   [Crawling](node.md#crawling)\
    \
*   [Usage](node.md#usage)\
    \
*   [Check Crawl Job](node.md#check-crawl-job)\
    \
*   [Response](node.md#response-2)\
    \
*   [Extraction](node.md#extraction)\
    \
*   [Extracting without schema (New)](node.md#extracting-without-schema-new)\
    \
*   [Interacting with the page with Actions](node.md#interacting-with-the-page-with-actions)\
    \
*   [Example](node.md#example)\
    \
*   [Output](node.md#output)\
    \
*   [Open Source vs Cloud](node.md#open-source-vs-cloud)\
    \
*   [Contributing](node.md#contributing)\
    \
\
Assistant\
\
Responses are generated using AI and may contain mistakes.