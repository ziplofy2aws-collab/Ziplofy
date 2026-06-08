"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("../config/database.config");
const country_model_1 = require("../models/country/country.model");
const state_model_1 = require("../models/state/state.model");
dotenv_1.default.config();
async function fetchCountriesNowStates() {
    const map = new Map();
    try {
        const url = 'https://countriesnow.space/api/v0.1/countries/states';
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch states from countriesnow.space: ${response.status} ${response.statusText}`);
            return map;
        }
        const body = await response.json();
        if (!body || !Array.isArray(body.data)) {
            console.warn('Unexpected countriesnow.space response format');
            return map;
        }
        body.data.forEach((country) => {
            if (!country || !country.iso2 || !Array.isArray(country.states))
                return;
            const states = country.states
                .filter((s) => s && typeof s.name === 'string' && s.name.trim().length > 0)
                .map((s) => ({
                name: s.name.trim(),
                code: typeof s.state_code === 'string' && s.state_code.trim().length > 0 ? s.state_code.trim() : undefined,
                type: 'state',
            }));
            if (states.length) {
                map.set(String(country.iso2).toUpperCase(), states);
            }
        });
    }
    catch (error) {
        console.error('Failed to fetch states from countriesnow.space', error);
    }
    return map;
}
// Known states/provinces for major countries (fallback data)
const knownStatesData = {
    US: [
        { name: 'Alabama', code: 'AL', type: 'state' },
        { name: 'Alaska', code: 'AK', type: 'state' },
        { name: 'Arizona', code: 'AZ', type: 'state' },
        { name: 'Arkansas', code: 'AR', type: 'state' },
        { name: 'California', code: 'CA', type: 'state' },
        { name: 'Colorado', code: 'CO', type: 'state' },
        { name: 'Connecticut', code: 'CT', type: 'state' },
        { name: 'Delaware', code: 'DE', type: 'state' },
        { name: 'Florida', code: 'FL', type: 'state' },
        { name: 'Georgia', code: 'GA', type: 'state' },
        { name: 'Hawaii', code: 'HI', type: 'state' },
        { name: 'Idaho', code: 'ID', type: 'state' },
        { name: 'Illinois', code: 'IL', type: 'state' },
        { name: 'Indiana', code: 'IN', type: 'state' },
        { name: 'Iowa', code: 'IA', type: 'state' },
        { name: 'Kansas', code: 'KS', type: 'state' },
        { name: 'Kentucky', code: 'KY', type: 'state' },
        { name: 'Louisiana', code: 'LA', type: 'state' },
        { name: 'Maine', code: 'ME', type: 'state' },
        { name: 'Maryland', code: 'MD', type: 'state' },
        { name: 'Massachusetts', code: 'MA', type: 'state' },
        { name: 'Michigan', code: 'MI', type: 'state' },
        { name: 'Minnesota', code: 'MN', type: 'state' },
        { name: 'Mississippi', code: 'MS', type: 'state' },
        { name: 'Missouri', code: 'MO', type: 'state' },
        { name: 'Montana', code: 'MT', type: 'state' },
        { name: 'Nebraska', code: 'NE', type: 'state' },
        { name: 'Nevada', code: 'NV', type: 'state' },
        { name: 'New Hampshire', code: 'NH', type: 'state' },
        { name: 'New Jersey', code: 'NJ', type: 'state' },
        { name: 'New Mexico', code: 'NM', type: 'state' },
        { name: 'New York', code: 'NY', type: 'state' },
        { name: 'North Carolina', code: 'NC', type: 'state' },
        { name: 'North Dakota', code: 'ND', type: 'state' },
        { name: 'Ohio', code: 'OH', type: 'state' },
        { name: 'Oklahoma', code: 'OK', type: 'state' },
        { name: 'Oregon', code: 'OR', type: 'state' },
        { name: 'Pennsylvania', code: 'PA', type: 'state' },
        { name: 'Rhode Island', code: 'RI', type: 'state' },
        { name: 'South Carolina', code: 'SC', type: 'state' },
        { name: 'South Dakota', code: 'SD', type: 'state' },
        { name: 'Tennessee', code: 'TN', type: 'state' },
        { name: 'Texas', code: 'TX', type: 'state' },
        { name: 'Utah', code: 'UT', type: 'state' },
        { name: 'Vermont', code: 'VT', type: 'state' },
        { name: 'Virginia', code: 'VA', type: 'state' },
        { name: 'Washington', code: 'WA', type: 'state' },
        { name: 'West Virginia', code: 'WV', type: 'state' },
        { name: 'Wisconsin', code: 'WI', type: 'state' },
        { name: 'Wyoming', code: 'WY', type: 'state' },
        { name: 'District of Columbia', code: 'DC', type: 'district' },
    ],
    CA: [
        { name: 'Alberta', code: 'AB', type: 'province' },
        { name: 'British Columbia', code: 'BC', type: 'province' },
        { name: 'Manitoba', code: 'MB', type: 'province' },
        { name: 'New Brunswick', code: 'NB', type: 'province' },
        { name: 'Newfoundland and Labrador', code: 'NL', type: 'province' },
        { name: 'Northwest Territories', code: 'NT', type: 'territory' },
        { name: 'Nova Scotia', code: 'NS', type: 'province' },
        { name: 'Nunavut', code: 'NU', type: 'territory' },
        { name: 'Ontario', code: 'ON', type: 'province' },
        { name: 'Prince Edward Island', code: 'PE', type: 'province' },
        { name: 'Quebec', code: 'QC', type: 'province' },
        { name: 'Saskatchewan', code: 'SK', type: 'province' },
        { name: 'Yukon', code: 'YT', type: 'territory' },
    ],
    AU: [
        { name: 'Australian Capital Territory', code: 'ACT', type: 'territory' },
        { name: 'New South Wales', code: 'NSW', type: 'state' },
        { name: 'Northern Territory', code: 'NT', type: 'territory' },
        { name: 'Queensland', code: 'QLD', type: 'state' },
        { name: 'South Australia', code: 'SA', type: 'state' },
        { name: 'Tasmania', code: 'TAS', type: 'state' },
        { name: 'Victoria', code: 'VIC', type: 'state' },
        { name: 'Western Australia', code: 'WA', type: 'state' },
    ],
    IN: [
        { name: 'Andhra Pradesh', code: 'AP', type: 'state' },
        { name: 'Arunachal Pradesh', code: 'AR', type: 'state' },
        { name: 'Assam', code: 'AS', type: 'state' },
        { name: 'Bihar', code: 'BR', type: 'state' },
        { name: 'Chhattisgarh', code: 'CT', type: 'state' },
        { name: 'Goa', code: 'GA', type: 'state' },
        { name: 'Gujarat', code: 'GJ', type: 'state' },
        { name: 'Haryana', code: 'HR', type: 'state' },
        { name: 'Himachal Pradesh', code: 'HP', type: 'state' },
        { name: 'Jharkhand', code: 'JH', type: 'state' },
        { name: 'Karnataka', code: 'KA', type: 'state' },
        { name: 'Kerala', code: 'KL', type: 'state' },
        { name: 'Madhya Pradesh', code: 'MP', type: 'state' },
        { name: 'Maharashtra', code: 'MH', type: 'state' },
        { name: 'Manipur', code: 'MN', type: 'state' },
        { name: 'Meghalaya', code: 'ML', type: 'state' },
        { name: 'Mizoram', code: 'MZ', type: 'state' },
        { name: 'Nagaland', code: 'NL', type: 'state' },
        { name: 'Odisha', code: 'OR', type: 'state' },
        { name: 'Punjab', code: 'PB', type: 'state' },
        { name: 'Rajasthan', code: 'RJ', type: 'state' },
        { name: 'Sikkim', code: 'SK', type: 'state' },
        { name: 'Tamil Nadu', code: 'TN', type: 'state' },
        { name: 'Telangana', code: 'TG', type: 'state' },
        { name: 'Tripura', code: 'TR', type: 'state' },
        { name: 'Uttar Pradesh', code: 'UP', type: 'state' },
        { name: 'Uttarakhand', code: 'UT', type: 'state' },
        { name: 'West Bengal', code: 'WB', type: 'state' },
        { name: 'Andaman and Nicobar Islands', code: 'AN', type: 'union territory' },
        { name: 'Chandigarh', code: 'CH', type: 'union territory' },
        { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DH', type: 'union territory' },
        { name: 'Delhi', code: 'DL', type: 'union territory' },
        { name: 'Jammu and Kashmir', code: 'JK', type: 'union territory' },
        { name: 'Ladakh', code: 'LA', type: 'union territory' },
        { name: 'Lakshadweep', code: 'LD', type: 'union territory' },
        { name: 'Puducherry', code: 'PY', type: 'union territory' },
    ],
    BR: [
        { name: 'Acre', code: 'AC', type: 'state' },
        { name: 'Alagoas', code: 'AL', type: 'state' },
        { name: 'Amapá', code: 'AP', type: 'state' },
        { name: 'Amazonas', code: 'AM', type: 'state' },
        { name: 'Bahia', code: 'BA', type: 'state' },
        { name: 'Ceará', code: 'CE', type: 'state' },
        { name: 'Distrito Federal', code: 'DF', type: 'federal district' },
        { name: 'Espírito Santo', code: 'ES', type: 'state' },
        { name: 'Goiás', code: 'GO', type: 'state' },
        { name: 'Maranhão', code: 'MA', type: 'state' },
        { name: 'Mato Grosso', code: 'MT', type: 'state' },
        { name: 'Mato Grosso do Sul', code: 'MS', type: 'state' },
        { name: 'Minas Gerais', code: 'MG', type: 'state' },
        { name: 'Pará', code: 'PA', type: 'state' },
        { name: 'Paraíba', code: 'PB', type: 'state' },
        { name: 'Paraná', code: 'PR', type: 'state' },
        { name: 'Pernambuco', code: 'PE', type: 'state' },
        { name: 'Piauí', code: 'PI', type: 'state' },
        { name: 'Rio de Janeiro', code: 'RJ', type: 'state' },
        { name: 'Rio Grande do Norte', code: 'RN', type: 'state' },
        { name: 'Rio Grande do Sul', code: 'RS', type: 'state' },
        { name: 'Rondônia', code: 'RO', type: 'state' },
        { name: 'Roraima', code: 'RR', type: 'state' },
        { name: 'Santa Catarina', code: 'SC', type: 'state' },
        { name: 'São Paulo', code: 'SP', type: 'state' },
        { name: 'Sergipe', code: 'SE', type: 'state' },
        { name: 'Tocantins', code: 'TO', type: 'state' },
    ],
    MX: [
        { name: 'Aguascalientes', code: 'AG', type: 'state' },
        { name: 'Baja California', code: 'BC', type: 'state' },
        { name: 'Baja California Sur', code: 'BS', type: 'state' },
        { name: 'Campeche', code: 'CM', type: 'state' },
        { name: 'Chiapas', code: 'CS', type: 'state' },
        { name: 'Chihuahua', code: 'CH', type: 'state' },
        { name: 'Ciudad de México', code: 'DF', type: 'federal district' },
        { name: 'Coahuila', code: 'CO', type: 'state' },
        { name: 'Colima', code: 'CL', type: 'state' },
        { name: 'Durango', code: 'DG', type: 'state' },
        { name: 'Guanajuato', code: 'GT', type: 'state' },
        { name: 'Guerrero', code: 'GR', type: 'state' },
        { name: 'Hidalgo', code: 'HG', type: 'state' },
        { name: 'Jalisco', code: 'JA', type: 'state' },
        { name: 'México', code: 'MX', type: 'state' },
        { name: 'Michoacán', code: 'MC', type: 'state' },
        { name: 'Morelos', code: 'MO', type: 'state' },
        { name: 'Nayarit', code: 'NA', type: 'state' },
        { name: 'Nuevo León', code: 'NL', type: 'state' },
        { name: 'Oaxaca', code: 'OA', type: 'state' },
        { name: 'Puebla', code: 'PU', type: 'state' },
        { name: 'Querétaro', code: 'QT', type: 'state' },
        { name: 'Quintana Roo', code: 'QR', type: 'state' },
        { name: 'San Luis Potosí', code: 'SL', type: 'state' },
        { name: 'Sinaloa', code: 'SI', type: 'state' },
        { name: 'Sonora', code: 'SO', type: 'state' },
        { name: 'Tabasco', code: 'TB', type: 'state' },
        { name: 'Tamaulipas', code: 'TM', type: 'state' },
        { name: 'Tlaxcala', code: 'TL', type: 'state' },
        { name: 'Veracruz', code: 'VE', type: 'state' },
        { name: 'Yucatán', code: 'YU', type: 'state' },
        { name: 'Zacatecas', code: 'ZA', type: 'state' },
    ],
};
function normalizeStateCode(name, code) {
    let normalized = (code || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
    if (!normalized) {
        const initials = name
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join('');
        normalized = initials || name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'ST';
    }
    return normalized.slice(0, 10);
}
function sanitizeStates(states, defaultType = 'state') {
    const usedCodes = new Set();
    return states
        .map((state) => {
        const name = state.name?.trim();
        if (!name)
            return null;
        const initialCode = normalizeStateCode(name, state.code);
        let code = initialCode;
        let counter = 1;
        while (usedCodes.has(code)) {
            code = `${initialCode}${counter}`;
            counter += 1;
        }
        usedCodes.add(code);
        return {
            name,
            code,
            type: state.type || defaultType,
        };
    })
        .filter(Boolean);
}
// Fetch states from Geonames API (requires username, but has free tier)
// Note: This requires first getting the country's geonameId, then fetching children
async function fetchStatesFromGeonames(countryIso2, username = 'demo') {
    try {
        // First, get the country's geonameId
        const countryUrl = `http://api.geonames.org/searchJSON?country=${countryIso2}&featureCode=PCLI&maxRows=1&username=${username}`;
        const countryResponse = await fetch(countryUrl);
        if (!countryResponse.ok) {
            return null;
        }
        const countryData = await countryResponse.json();
        if (!countryData.geonames || countryData.geonames.length === 0) {
            return null;
        }
        const countryGeonameId = countryData.geonames[0].geonameId;
        // Now fetch the administrative divisions (states/provinces)
        const statesUrl = `http://api.geonames.org/childrenJSON?geonameId=${countryGeonameId}&username=${username}`;
        const statesResponse = await fetch(statesUrl);
        if (!statesResponse.ok) {
            return null;
        }
        const statesData = await statesResponse.json();
        if (statesData.geonames && Array.isArray(statesData.geonames)) {
            return statesData.geonames
                .filter((item) => item.fcode === 'ADM1') // Administrative division level 1
                .map((item) => ({
                name: item.name,
                code: item.adminCodes1?.ISO3166_2?.split('-')[1] || item.geonameId.toString().slice(-2).toUpperCase(),
            }));
        }
        return null;
    }
    catch (error) {
        console.error(`Error fetching states from Geonames for ${countryIso2}:`, error);
        return null;
    }
}
// Fetch states from REST Countries API (limited support)
async function fetchStatesFromRestCountries(countryIso2) {
    try {
        // REST Countries doesn't directly provide states, but we can try alternative endpoints
        // For now, return null as REST Countries doesn't have states data
        return null;
    }
    catch (error) {
        return null;
    }
}
async function seedStates() {
    try {
        await (0, database_config_1.connectDB)();
        console.log('Connected to database');
        // Fetch all countries from database
        const countries = await country_model_1.Country.find({}).lean();
        console.log(`Found ${countries.length} countries to process`);
        const countriesNowStateMap = await fetchCountriesNowStates();
        console.log(`Fetched states data for ${countriesNowStateMap.size} countries from countriesnow.space`);
        let totalSeeded = 0;
        let totalSkipped = 0;
        const errors = [];
        // Process each country
        for (const country of countries) {
            const countryIso2 = (country.iso2 || '').toUpperCase();
            if (!countryIso2) {
                console.log(`Skipping country ${country.name}: No ISO2 code`);
                totalSkipped++;
                continue;
            }
            console.log(`Processing ${country.name} (${countryIso2})...`);
            let states = [];
            const apiStates = countriesNowStateMap.get(countryIso2);
            if (apiStates && apiStates.length > 0) {
                states = apiStates;
                console.log(`  Using countriesnow.space data: ${states.length} states/provinces`);
            }
            if (states.length === 0 && knownStatesData[countryIso2]) {
                states = knownStatesData[countryIso2];
                console.log(`  Using known states data: ${states.length} states/provinces`);
            }
            if (states.length === 0) {
                const geonamesUsername = process.env.GEONAMES_USERNAME || 'demo';
                if (geonamesUsername !== 'demo') {
                    const geonamesStates = await fetchStatesFromGeonames(countryIso2, geonamesUsername);
                    if (geonamesStates && geonamesStates.length > 0) {
                        states = geonamesStates.map((s) => ({ ...s, type: 'state' }));
                        console.log(`  Fetched from Geonames: ${states.length} states/provinces`);
                    }
                }
            }
            if (!states || states.length === 0) {
                console.log(`  No states data available for ${country.name}`);
                totalSkipped++;
                continue;
            }
            const sanitizedStates = sanitizeStates(states);
            if (!sanitizedStates.length) {
                console.log(`  States data for ${country.name} could not be sanitized`);
                totalSkipped++;
                continue;
            }
            // Prepare bulk write operations
            const stateOps = sanitizedStates.map((state) => ({
                updateOne: {
                    filter: {
                        countryId: country._id,
                        code: state.code.toUpperCase(),
                    },
                    update: {
                        $set: {
                            name: state.name,
                            code: state.code.toUpperCase(),
                            countryId: country._id,
                            countryIso2: countryIso2,
                            type: state.type || 'state',
                        },
                    },
                    upsert: true,
                },
            }));
            try {
                const result = await state_model_1.State.bulkWrite(stateOps, { ordered: false });
                const seeded = result.upsertedCount + result.modifiedCount;
                totalSeeded += seeded;
                console.log(`  ✓ Seeded ${seeded} states/provinces for ${country.name}`);
            }
            catch (error) {
                const errorMsg = error.message || 'Unknown error';
                errors.push({ country: country.name, error: errorMsg });
                console.error(`  ✗ Error seeding states for ${country.name}:`, errorMsg);
            }
            // Add a small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        console.log('\n=== Seeding Summary ===');
        console.log(`Total countries processed: ${countries.length}`);
        console.log(`Total states/provinces seeded: ${totalSeeded}`);
        console.log(`Countries skipped: ${totalSkipped}`);
        if (errors.length > 0) {
            console.log(`\nErrors encountered: ${errors.length}`);
            errors.forEach((err) => {
                console.log(`  - ${err.country}: ${err.error}`);
            });
        }
        console.log('\nStates seeding completed!');
        process.exit(0);
    }
    catch (err) {
        console.error('Error seeding states:', err);
        process.exit(1);
    }
}
seedStates();
