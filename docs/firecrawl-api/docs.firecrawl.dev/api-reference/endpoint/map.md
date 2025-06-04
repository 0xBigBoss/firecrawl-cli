[Firecrawl Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo.png)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/firecrawl/logo/logo-dark.png)](https://firecrawl.dev/)

v1

Search...

Ctrl KAsk AI

Search...

Navigation

Map Endpoints

Map

[Documentation](../../introduction.md)
[SDKs](../../sdks/overview.md)
[Learn](https://www.firecrawl.dev/blog/category/tutorials)
[Integrations](https://www.firecrawl.dev/app)
[API Reference](../introduction.md)

POST

/

map

Try it

cURL

Python

JavaScript

PHP

Go

Java

Copy

    curl --request POST \
      --url https://api.firecrawl.dev/v1/map \
      --header 'Authorization: Bearer <token>' \
      --header 'Content-Type: application/json' \
      --data '{
      "url": "<string>",
      "search": "<string>",
      "ignoreSitemap": true,
      "sitemapOnly": false,
      "includeSubdomains": false,
      "limit": 5000,
      "timeout": 123
    }'

200

402

429

500

Copy

    {
      "success": true,
      "links": [\
        "<string>"\
      ]
    }

#### Authorizations

[​](map.md#authorization-authorization)

Authorization

string

header

required

Bearer authentication header of the form `Bearer <token>`, where `<token>` is your auth token.

#### Body

application/json

[​](map.md#body-url)

url

string

required

The base URL to start crawling from

[​](map.md#body-search)

search

string

Search query to use for mapping. During the Alpha phase, the 'smart' part of the search functionality is limited to 1000 search results. However, if map finds more results, there is no limit applied.

[​](map.md#body-ignore-sitemap)

ignoreSitemap

boolean

default:true

Ignore the website sitemap when crawling.

[​](map.md#body-sitemap-only)

sitemapOnly

boolean

default:false

Only return links found in the website sitemap

[​](map.md#body-include-subdomains)

includeSubdomains

boolean

default:false

Include subdomains of the website

[​](map.md#body-limit)

limit

integer

default:5000

Maximum number of links to return

Required range: `x <= 30000`

[​](map.md#body-timeout)

timeout

integer

Timeout in milliseconds. There is no timeout by default.

#### Response

200

200402429500

application/json

Successful response

[​](map.md#response-success)

success

boolean

[​](map.md#response-links)

links

string\[\]

[Suggest edits](https://github.com/mendableai/firecrawl-docs/edit/main/api-reference/endpoint/map.mdx)
[Raise issue](https://github.com/mendableai/firecrawl-docs/issues/new?title=Issue%20on%20docs&body=Path:%20/api-reference/endpoint/map)

[Get Crawl Errors](crawl-get-errors.md)
[Search](search.md)

cURL

Python

JavaScript

PHP

Go

Java

Copy

    curl --request POST \
      --url https://api.firecrawl.dev/v1/map \
      --header 'Authorization: Bearer <token>' \
      --header 'Content-Type: application/json' \
      --data '{
      "url": "<string>",
      "search": "<string>",
      "ignoreSitemap": true,
      "sitemapOnly": false,
      "includeSubdomains": false,
      "limit": 5000,
      "timeout": 123
    }'

200

402

429

500

Copy

    {
      "success": true,
      "links": [\
        "<string>"\
      ]
    }

Assistant

Responses are generated using AI and may contain mistakes.