import fs from 'fs';
import path from 'path';

// ---- Types ----
interface Country {
	isoCode: string;
	name: string;
	latitude?: number;
	longitude?: number;
	timezones?: string[];
	[key: string]: any; // for any extra fields you might have
}

// ---- Paths ----
const dataDir = path.join(__dirname, '../data');
const outputDir = path.join(__dirname, '../../data');

const countriesPath = path.join(dataDir, '../assets/country.json');

// ---- Helpers ----
function writeJSON(fileName: string, data: any) {
	fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(data, null, 2), 'utf-8');
}

// ---- Main ----
function generateFiles() {
	// Ensure output dir exists
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const countries: Country[] = JSON.parse(fs.readFileSync(countriesPath, 'utf-8'));

	// GEO: remove timezones, keep lat/lon
	const geo = countries.map(({ timezones, ...rest }) => ({
		...rest,
	}));

	// LITE: remove lat/lon
	const lite = countries.map(({ latitude, longitude, ...rest }) => ({
		...rest,
	}));

	// TIMEZONE: only isoCode, name, timezones
	const timezone = countries.map(({ isoCode, name, timezones }) => ({
		isoCode,
		name,
		timezones,
	}));

	// MERGED: lat/lon + timezones + everything else
	const merged: Country[] = countries.map((country) => ({
		...country,
		// Ensure timezones are included even if Geo stripped them
		timezones: country.timezones ?? [],
	}));

	// ---- Write all files ----
	writeJSON('allCountries.geo.json', geo);
	writeJSON('allCountries.lite.json', lite);
	writeJSON('allCountries.timezones.json', timezone);
	writeJSON('allCountries.json', merged);

	console.log('✅ All country files generated successfully!');
}

generateFiles();
