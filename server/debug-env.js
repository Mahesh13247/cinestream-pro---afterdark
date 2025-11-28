import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

const result = dotenv.config();

if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('.env file loaded successfully');
}

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
    console.log('DATABASE_URL is set');
    console.log('URL starts with:', dbUrl.substring(0, 15) + '...');
} else {
    console.error('DATABASE_URL is NOT set');
}
