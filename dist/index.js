"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const maxmind_1 = __importDefault(require("maxmind"));
const geo_tz_1 = require("geo-tz");
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const port = 3000;
const loadCountryData = (countryCode) => {
    try {
        const filePath = (0, path_1.join)(__dirname, `../data/countries/${countryCode}.json`);
        if (fs_1.default.existsSync(filePath)) {
            return JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.error(`Error loading country data for ${countryCode}:`, error);
        return null;
    }
};
(async () => {
    let lookup;
    try {
        const dbPath = (0, path_1.resolve)(__dirname, '../data/GeoLite2-City.mmdb');
        lookup = await maxmind_1.default.open(dbPath);
    }
    catch (error) {
        console.error(`Failed to open the GeoLite2 database`, error);
        process.exit(1);
    }
    app.get('/api/location/:ip', (req, res) => {
        try {
            let results = {};
            const ip = req.params.ip;
            // Get geolocation data from the database
            const geoData = lookup.get(ip);
            if (!geoData) {
                throw { error: 'IP address not found' };
            }
            // Extract necessary information
            const { country, city, location, postal, subdivisions } = geoData;
            if (location) {
                const timezone = (0, geo_tz_1.find)(location.latitude, location.longitude)[0];
                const currentTime = new Date().toLocaleString('en-US', { timeZone: timezone });
                if (country) {
                    const countryInfo = loadCountryData(country.iso_code);
                    console.log(countryInfo);
                    if (!countryInfo) {
                        throw { error: 'Country data not found' };
                    }
                    results = {
                        ip: ip,
                        hostname: ip,
                        type: "ipv4",
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
                            geoname_id: 'no id',
                            capital: countryInfo.iso_short_name,
                            languages: countryInfo.languages_spoken,
                            country_flag: `http://localhost:3000/images/assets/flags_svg/${country.iso_code.toLowerCase()}.svg`,
                            country_flag_emoji: "🇺🇸",
                            country_flag_emoji_unicode: "U+1F1FA U+1F1F8",
                            calling_code: countryInfo.country_code,
                            is_eu: false
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
                            name: "US Dollar", // You can add currency name in the JSON
                            plural: "US dollars", // You can add plural name in the JSON
                            symbol: "$",
                            symbol_native: "$"
                        },
                        connection: {
                            asn: null,
                            isp: null
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
            }
            else {
                throw { error: 'location coordinates data not found' };
            }
        }
        catch (error) {
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
})();
//# sourceMappingURL=index.js.map