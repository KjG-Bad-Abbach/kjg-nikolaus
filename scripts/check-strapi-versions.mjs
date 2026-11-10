import { fileURLToPath } from 'node:url';
import { checkStrapiVersions } from './strapi-versions.mjs';

try {
  const version = checkStrapiVersions(fileURLToPath(new URL('../', import.meta.url)));
  console.log(`Strapi versions and applied codemods match ${version}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
