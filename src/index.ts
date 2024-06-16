import express, { Request, Response } from 'express';
import maxmind, { CityResponse, Reader } from 'maxmind';
import { find } from 'geo-tz';
import { resolve, join } from 'path';
import fs from 'fs';
import countryFlagAndEmoji from '../data/country_flag_and_emojis/by-code.json'
import currencyDetails from '../data/currency_details.json'

const app = express();
const port = 3000;

const loadCountryData = (countryCode: string) => {
    try {
        const filePath = join(__dirname, `../data/countries/${countryCode}.json`);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            return data[countryCode];
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error loading country data for ${countryCode}:`, error);
        return null;
    }
};

const getIpType = (ipAddress: string): string => {
    const ipv4Pattern: RegExp = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern: RegExp = /^([0-9a-fA-F]{0,4}:){2,7}([0-9a-fA-F]{0,4})$/;

    if (ipv4Pattern.test(ipAddress)) {
        return "IPv4";
    } else if (ipv6Pattern.test(ipAddress)) {
        return "IPv6";
    } else {
        return "Invalid IP address";
    }
}


(async () => {

    let lookup: Reader<CityResponse>;

    try {
        const dbPath = resolve(__dirname, '../data/GeoLite2-City.mmdb');
        lookup = await maxmind.open<CityResponse>(dbPath);
    } catch (error) {
        console.error(`Failed to open the GeoLite2 database`, error);
        process.exit(1);
    }

    app.get('/api/location/:ip', async (req: Request, res: Response) => {
        try {
            let results = {}

            const ip = req.params.ip;

            // Get geolocation data from the database
            const geoData: CityResponse | null = lookup.get(ip);

            if (!geoData) {
                throw { error: 'IP address not found' };
            }

            // Extract necessary information
            const { country, city, location, postal, subdivisions } = geoData;

            const connectionResponse = await fetch(`http://ip-api.com/json/${ip}`)
            const connectionResponseData = await connectionResponse.json()
            

            if (location) {
                const timezone = find(location.latitude, location.longitude)[0];

                const currentTime = new Date().toLocaleString('en-US', { timeZone: timezone });

                if (country) {
                    const countryInfo = loadCountryData(country.iso_code);
                    const _countryFlagAndEmoji = countryFlagAndEmoji[country.iso_code];

                    const _currencyDetails = currencyDetails[countryInfo.currency_code] || currencyDetails['NONE']
                    
                    if (!countryInfo) {
                        throw { error: 'Country data not found' };
                    }
                    
                    results = {
                        ip: ip,
                        hostname: ip,
                        type: getIpType(ip),
                        continent_code: country.iso_code,
                        continent_name: country.names.en,
                        country_code: country.iso_code,
                        country_name: country.names.en,
                        region_code: subdivisions?.[0]?.iso_code,
                        region_name: subdivisions?.[0]?.names.en,
                        city: city?.names.en,
                        zip: postal?.code,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        location: {
                            geoname_id: country.geoname_id,
                            capital: _currencyDetails.name,
                            languages: countryInfo.languages_spoken,
                            country_flag: _countryFlagAndEmoji.image,
                            country_flag_emoji: _countryFlagAndEmoji.emoji,
                            country_flag_emoji_unicode: _countryFlagAndEmoji.unicode,
                            calling_code: countryInfo.country_code,
                            is_eu: false,
                            name: _countryFlagAndEmoji.name
                        },
                        time_zone: {
                            id: timezone,
                            current_time: currentTime,
                            gmt_offset: new Date().getTimezoneOffset() * 60, // Approximation
                            code: timezone.split('/').pop(),
                            is_daylight_saving: true
                        },
                        currency: {
                            code: countryInfo.currency_code,
                            name: _currencyDetails.name, // You can add currency name in the JSON
                            plural: _currencyDetails.name_plural, // You can add plural name in the JSON
                            symbol: _currencyDetails.symbol,
                            symbol_native: _currencyDetails.symbol_native
                        },
                        connection: {
                            asn: null,
                            isp: connectionResponseData.isp,
                            org: connectionResponseData.org,
                            as: connectionResponseData.as,
                            query: connectionResponseData.query,
                        },
                        security: {
                            is_proxy: false,
                            proxy_type: null,
                            is_crawler: false,
                            crawler_name: null,
                            crawler_type: null,
                            is_tor: false,
                            threat_level: "low",
                            threat_types: null
                        }
                    };
                }

                res.status(200).json({
                    error: false,
                    data: results
                });
            } else {
                throw { error: 'location coordinates data not found' };
            }
        } catch (error) {
            console.log(error);
            
            res.status(411).json({
                error: true,
                data: JSON.stringify(error)
            });
        }
    });

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

})()