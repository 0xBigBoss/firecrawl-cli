[Firecrawl Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo.png)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo-dark.png)](https://firecrawl.dev/)

v1

Search...

Ctrl KAsk AI

Search...

Navigation

Scrape Endpoints

Scrape

[Documentation](../../introduction.md)
[SDKs](../../sdks/overview.md)
[Learn](https://www.firecrawl.dev/blog/category/tutorials)
[Integrations](https://www.firecrawl.dev/app)
[API Reference](../introduction.md)

POST

/

scrape

Try it

cURL

Python

JavaScript

PHP

Go

Java

Copy

    curl --request POST \
      --url https://api.firecrawl.dev/v1/scrape \
      --header 'Authorization: Bearer <token>' \
      --header 'Content-Type: application/json' \
      --data '{
      "url": "<string>",
      "formats": [\
        "markdown"\
      ],
      "onlyMainContent": true,
      "includeTags": [\
        "<string>"\
      ],
      "excludeTags": [\
        "<string>"\
      ],
      "headers": {},
      "waitFor": 0,
      "mobile": false,
      "skipTlsVerification": false,
      "timeout": 30000,
      "parsePDF": true,
      "jsonOptions": {
        "schema": {},
        "systemPrompt": "<string>",
        "prompt": "<string>"
      },
      "actions": [\
        {\
          "type": "wait",\
          "milliseconds": 2,\
          "selector": "#my-element"\
        }\
      ],
      "location": {
        "country": "US",
        "languages": [\
          "en-US"\
        ]
      },
      "removeBase64Images": true,
      "blockAds": true,
      "proxy": "basic",
      "changeTrackingOptions": {
        "modes": [\
          "git-diff"\
        ],
        "schema": {},
        "prompt": "<string>"
      },
      "storeInCache": true
    }'

200

402

429

500

Copy

    {
      "success": true,
      "data": {
        "markdown": "<string>",
        "html": "<string>",
        "rawHtml": "<string>",
        "screenshot": "<string>",
        "links": [\
          "<string>"\
        ],
        "actions": {
          "screenshots": [\
            "<string>"\
          ],
          "scrapes": [\
            {\
              "url": "<string>",\
              "html": "<string>"\
            }\
          ],
          "javascriptReturns": [\
            {\
              "type": "<string>",\
              "value": "<any>"\
            }\
          ]
        },
        "metadata": {
          "title": "<string>",
          "description": "<string>",
          "language": "<string>",
          "sourceURL": "<string>",
          "<any other metadata> ": "<string>",
          "statusCode": 123,
          "error": "<string>"
        },
        "llm_extraction": {},
        "warning": "<string>",
        "changeTracking": {
          "previousScrapeAt": "2023-11-07T05:31:56Z",
          "changeStatus": "new",
          "visibility": "visible",
          "diff": "<string>",
          "json": {}
        }
      }
    }

#### Authorizations

[​](scrape.md#authorization-authorization)

Authorization

string

header

required

Bearer authentication header of the form `Bearer <token>`, where `<token>` is your auth token.

#### Body

application/json

[​](scrape.md#body-url)

url

string

required

The URL to scrape

[​](scrape.md#body-formats)

formats

enum<string>\[\]

Formats to include in the output.

Show child attributes

[​](scrape.md#parameter-element)

enum<string>

Available options:

`markdown`,

`html`,

`rawHtml`,

`links`,

`screenshot`,

`screenshot@fullPage`,

`json`,

`changeTracking`

[​](scrape.md#body-only-main-content)

onlyMainContent

boolean

default:true

Only return the main content of the page excluding headers, navs, footers, etc.

[​](scrape.md#body-include-tags)

includeTags

string\[\]

Tags to include in the output.

[​](scrape.md#body-exclude-tags)

excludeTags

string\[\]

Tags to exclude from the output.

[​](scrape.md#body-headers)

headers

object

Headers to send with the request. Can be used to send cookies, user-agent, etc.

[​](scrape.md#body-wait-for)

waitFor

integer

default:0

Specify a delay in milliseconds before fetching the content, allowing the page sufficient time to load.

[​](scrape.md#body-mobile)

mobile

boolean

default:false

Set to true if you want to emulate scraping from a mobile device. Useful for testing responsive pages and taking mobile screenshots.

[​](scrape.md#body-skip-tls-verification)

skipTlsVerification

boolean

default:false

Skip TLS certificate verification when making requests

[​](scrape.md#body-timeout)

timeout

integer

default:30000

Timeout in milliseconds for the request

[​](scrape.md#body-parse-pdf)

parsePDF

boolean

default:true

Controls how PDF files are processed during scraping. When true, the PDF content is extracted and converted to markdown format, with billing based on the number of pages (1 credit per page). When false, the PDF file is returned in base64 encoding with a flat rate of 1 credit total.

[​](scrape.md#body-json-options)

jsonOptions

object

JSON options object

Show child attributes

[​](scrape.md#body-actions)

actions

object\[\]

Actions to perform on the page before grabbing the content

*   Wait
*   Screenshot
*   Click
*   Write text
*   Press a key
*   Scroll
*   Scrape
*   Execute JavaScript

Show child attributes

[​](scrape.md#body-location)

location

object

Location settings for the request. When specified, this will use an appropriate proxy if available and emulate the corresponding language and timezone settings. Defaults to 'US' if not specified.

Show child attributes

[​](scrape.md#body-remove-base64-images)

removeBase64Images

boolean

Removes all base 64 images from the output, which may be overwhelmingly long. The image's alt text remains in the output, but the URL is replaced with a placeholder.

[​](scrape.md#body-block-ads)

blockAds

boolean

default:true

Enables ad-blocking and cookie popup blocking.

[​](scrape.md#body-proxy)

proxy

enum<string>

Specifies the type of proxy to use.

*   **basic**: Proxies for scraping sites with none to basic anti-bot solutions. Fast and usually works.
*   **stealth**: Stealth proxies for scraping sites with advanced anti-bot solutions. Slower, but more reliable on certain sites. Costs up to 5 credits per request.
*   **auto**: Firecrawl will automatically retry scraping with stealth proxies if the basic proxy fails. If the retry with stealth is successful, 5 credits will be billed for the scrape. If the first attempt with basic is successful, only the regular cost will be billed.

If you do not specify a proxy, Firecrawl will default to basic.

Available options:

`basic`,

`stealth`,

`auto`

[​](scrape.md#body-change-tracking-options)

changeTrackingOptions

object

Options for change tracking (Beta). Only applicable when 'changeTracking' is included in formats. The 'markdown' format must also be specified when using change tracking.

Show child attributes

[​](scrape.md#body-store-in-cache)

storeInCache

boolean

default:true

If true, the page will be stored in the Firecrawl index and cache. Setting this to false is useful if your scraping activity may have data protection concerns. Using some parameters associated with sensitive scraping (actions, headers) will force this parameter to be false.

#### Response

200

200402429500

application/json

Successful response

[​](scrape.md#response-success)

success

boolean

[​](scrape.md#response-data)

data

object

Show child attributes

[Suggest edits](https://github.com/mendableai/firecrawl-docs/edit/main/api-reference/endpoint/scrape.mdx)
[Raise issue](https://github.com/mendableai/firecrawl-docs/issues/new?title=Issue%20on%20docs&body=Path:%20/api-reference/endpoint/scrape)

[Introduction](../introduction.md)
[Batch Scrape](batch-scrape.md)

cURL

Python

JavaScript

PHP

Go

Java

Copy

    curl --request POST \
      --url https://api.firecrawl.dev/v1/scrape \
      --header 'Authorization: Bearer <token>' \
      --header 'Content-Type: application/json' \
      --data '{
      "url": "<string>",
      "formats": [\
        "markdown"\
      ],
      "onlyMainContent": true,
      "includeTags": [\
        "<string>"\
      ],
      "excludeTags": [\
        "<string>"\
      ],
      "headers": {},
      "waitFor": 0,
      "mobile": false,
      "skipTlsVerification": false,
      "timeout": 30000,
      "parsePDF": true,
      "jsonOptions": {
        "schema": {},
        "systemPrompt": "<string>",
        "prompt": "<string>"
      },
      "actions": [\
        {\
          "type": "wait",\
          "milliseconds": 2,\
          "selector": "#my-element"\
        }\
      ],
      "location": {
        "country": "US",
        "languages": [\
          "en-US"\
        ]
      },
      "removeBase64Images": true,
      "blockAds": true,
      "proxy": "basic",
      "changeTrackingOptions": {
        "modes": [\
          "git-diff"\
        ],
        "schema": {},
        "prompt": "<string>"
      },
      "storeInCache": true
    }'

200

402

429

500

Copy

    {
      "success": true,
      "data": {
        "markdown": "<string>",
        "html": "<string>",
        "rawHtml": "<string>",
        "screenshot": "<string>",
        "links": [\
          "<string>"\
        ],
        "actions": {
          "screenshots": [\
            "<string>"\
          ],
          "scrapes": [\
            {\
              "url": "<string>",\
              "html": "<string>"\
            }\
          ],
          "javascriptReturns": [\
            {\
              "type": "<string>",\
              "value": "<any>"\
            }\
          ]
        },
        "metadata": {
          "title": "<string>",
          "description": "<string>",
          "language": "<string>",
          "sourceURL": "<string>",
          "<any other metadata> ": "<string>",
          "statusCode": 123,
          "error": "<string>"
        },
        "llm_extraction": {},
        "warning": "<string>",
        "changeTracking": {
          "previousScrapeAt": "2023-11-07T05:31:56Z",
          "changeStatus": "new",
          "visibility": "visible",
          "diff": "<string>",
          "json": {}
        }
      }
    }

Assistant

Responses are generated using AI and may contain mistakes.