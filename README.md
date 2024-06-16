# IP Finder API

This is a simple backend API built with Express that provides detailed information about a given IP address. It uses MaxMind's GeoLite2 database for geolocation, `geo-tz` for timezone information, and `ip-api` for additional connection details.

## Features

- Retrieve detailed information about an IP address including location, timezone, country details, currency, and connection information.
- Supports both IPv4 and IPv6 addresses.

## Prerequisites

- Node.js (v12.x or later)
- npm (v6.x or later)

## Setup

1. Clone the repository:

    ```sh
    git clone <repository_url>
    cd <repository_directory>
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Ensure you have the MaxMind GeoLite2-City database file. Download it from [MaxMind's website](https://dev.maxmind.com/geoip/geoip2/geolite2/) and place it in the `data` directory with the name `GeoLite2-City.mmdb`.

4. Make sure you have the following JSON data files in the `data` directory:
    - `country_flag_and_emojis/by-code.json`: Contains flag images, emojis, and unicode by country code.
    - `currency_details.json`: Contains currency details including code, name, plural name, symbol, and native symbol.

5. For each country, there should be a JSON file in the `data/countries` directory named with the country's ISO code (e.g., `US.json`) containing country-specific details like languages spoken and currency code.

## Running the Server

Start the server with the following command:

```sh
npm start
```

The server will run on http://localhost:3000.

## API Endpoint
### Get IP Details
#### Endpoint: /api/location/:ip

Method: GET

Description: Retrieve detailed information about a given IP address.

Parameters:
- `ip`: The IP address to lookup (IPv4 or IPv6).

Example Request:

```sh
curl http://localhost:3000/api/location/8.8.8.8
```

Example Response:

```json
{
    "error": false,
    "data": {
        "ip": "8.8.8.8",
        "hostname": "8.8.8.8",
        "type": "IPv4",
        "continent_code": "NA",
        "continent_name": "North America",
        "country_code": "US",
        "country_name": "United States",
        "region_code": "CA",
        "region_name": "California",
        "city": "Mountain View",
        "zip": "94035",
        "latitude": 37.386,
        "longitude": -122.0838,
        "location": {
            "geoname_id": 6252001,
            "capital": "Washington D.C.",
            "languages": ["English"],
            "country_flag": "🇺🇸",
            "country_flag_emoji": "🇺🇸",
            "country_flag_emoji_unicode": "U+1F1FA U+1F1F8",
            "calling_code": "1",
            "is_eu": false,
            "name": "United States"
        },
        "time_zone": {
            "id": "America/Los_Angeles",
            "current_time": "2024-06-15T10:00:00-07:00",
            "gmt_offset": -25200,
            "code": "PDT",
            "is_daylight_saving": true
        },
        "currency": {
            "code": "USD",
            "name": "United States Dollar",
            "plural": "United States dollars",
            "symbol": "$",
            "symbol_native": "$"
        },
        "connection": {
            "asn": null,
            "isp": "Google LLC",
            "org": "Google LLC",
            "as": "AS15169 Google LLC",
            "query": "8.8.8.8"
        },
        "security": {
            "is_proxy": false,
            "proxy_type": null,
            "is_crawler": false,
            "crawler_name": null,
            "crawler_type": null,
            "is_tor": false,
            "threat_level": "low",
            "threat_types": null
        }
    }
}

```

## Error Handling

If there is an error in fetching the IP details, the API will return a JSON response with `error` set to `true` and the `data` field containing the error details.

Example Error Response:

```json
{
    "error": true,
    "data": "{\"error\":\"IP address not found\"}"
}

```

## License
This project is licensed under the MIT License.

Acknowledgements
- MaxMind GeoLite2
- geo-tz
- ip-api

Powered By [glitchfy](https://glitchfy.com)