# Crawl Clubs Data via Playwright

## Purpose

Automate club data extraction from the Dribl API using Playwright browser automation. The API has CORS restrictions preventing direct fetch, so a headless browser navigates to the fixtures page and intercepts the clubs API network response.

## Requirements

- Single CLI command that crawls the webpage and extracts the club information from http response, validates, transforms, and saves external club data to /data/external/clubs.json
- Reuse existing Zod schemas and transform logic
- No code duplication between `syncClubs.ts` and new extraction script
- Optional `--url` override for different seasons
- Backward compat: `sync:clubs` continues to work independently by using the extracted data
- The job should use playwright core to drive the browser
- The job should be available in package.json `crawl:clubs`
- We don't need to change anything existing except for building a new

## Inputs

- `--url` e.g. Given the URL as an input:
  https://fv.dribl.com/fixtures/?date_range=default&season=nPmrj2rmow&timezone=Australia%2FMelbourne. The specific api call we need to observe and get a response is https://mc-api.dribl.com/api/list/clubs?disable_paging=true

## API Response

It should be in the following format and we can store the raw value in `data/external/clubs.json`

```json
{
	"data": [
		{
			"type": "clubs",
			"id": "3vmZv3YLmq",
			"attributes": {
				"name": "Aintree SC",
				"slug": null,
				"image": "https:\/\/ocean.dribl.com\/86f34bc0855a4f519dd696483def4a47",
				"alt_image": null,
				"phone": null,
				"email": "aintreesc@gmail.com",
				"email_address": null,
				"url": null,
				"color": null,
				"accent": null,
				"address": {
					"address_line_1": "2 Recreation Road",
					"address_line_2": null,
					"city": "Aintree",
					"state": "VIC",
					"country": "AUS",
					"postcode": "3336"
				},
				"socials": [
					{
						"name": "facebook",
						"value": "https:\/\/www.facebook.com\/profile.php?id=100076200432306"
					},
					{ "name": "instagram", "value": "https:\/\/www.instagram.com\/aintreesoccerclub\/" }
				],
				"grounds": null
			},
			"links": { "self": { "href": "https:\/\/mc-api.dribl.com\/api\/clubs\/3vmZv3YLmq" } }
		}
	]
}
```

## Todo

- [x] Create `bin/crawlClubs.ts` (Playwright extraction + sync pipeline)
- [x] Add `crawl:clubs` npm script
- [x] Lint, format, type:check
- [x] Run `npm run crawl:clubs` to ensure success
