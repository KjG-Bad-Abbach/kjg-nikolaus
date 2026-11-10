import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const EXACT_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export const MARKER_PATH = 'backend/.last-applied-codemods-version';
export const STRAPI_COMMANDS =
  'Run from the repository root:\npnpm --dir backend strapi:codemods\npnpm --dir backend strapi:check';
const ALIGNMENT_RECOVERY =
  'Align the intended exact direct Strapi versions in both manifests; do not blindly downgrade to the current core. Regenerate affected lockfiles.\n' +
  STRAPI_COMMANDS;

/** @returns {boolean} */
export function isExactStrapiVersion(version) {
  return typeof version === 'string' && EXACT_VERSION.test(version);
}

/** @returns {{ dependencies?: Record<string, string>, devDependencies?: Record<string, string> }} */
function readManifest(repositoryRoot, manifestPath) {
  try {
    return JSON.parse(readFileSync(join(repositoryRoot, manifestPath), 'utf8'));
  } catch (error) {
    throw new Error(
      `${manifestPath}: ${error.message}\nRepair the manifest while preserving local edits.\n${STRAPI_COMMANDS}`,
    );
  }
}

/** @returns {string} */
export function validateStrapiVersions(repositoryRoot) {
  const backend = readManifest(repositoryRoot, 'backend/package.json');
  const coreVersion = backend.dependencies?.['@strapi/strapi'];
  if (!isExactStrapiVersion(coreVersion)) {
    throw new Error(
      `backend/package.json dependencies.@strapi/strapi: actual ${JSON.stringify(coreVersion) ?? 'missing'}; expected an exact SemVer release (x.y.z).\n${ALIGNMENT_RECOVERY}`,
    );
  }

  const frontend = readManifest(repositoryRoot, 'frontend/package.json');
  const failures = [];
  for (const [directory, manifest] of [
    ['backend', backend],
    ['frontend', frontend],
  ]) {
    for (const section of ['dependencies', 'devDependencies']) {
      for (const [name, version] of Object.entries(manifest[section] ?? {})) {
        if (name.startsWith('@strapi/') && version !== coreVersion) {
          failures.push(
            `${directory}/package.json ${section}.${name}: actual ${JSON.stringify(version)}; expected exact "${coreVersion}".`,
          );
        }
      }
    }
  }
  if (failures.length) {
    throw new Error(`${failures.join('\n')}\n${ALIGNMENT_RECOVERY}`);
  }
  return coreVersion;
}

/** @returns {Error} */
function markerError(appliedVersion, coreVersion) {
  return new Error(
    `${MARKER_PATH}: actual ${JSON.stringify(appliedVersion) ?? 'missing'}; expected "${coreVersion}" with an exact SemVer baseline.\nRecover the correct last-applied baseline while preserving local edits if tracking was lost or damaged. Do not manually advance the marker to bypass codemods.\n${STRAPI_COMMANDS}`,
  );
}

/** @returns {string} */
export function readAppliedCodemodsVersion(repositoryRoot, coreVersion) {
  let appliedVersion;
  try {
    appliedVersion = readFileSync(join(repositoryRoot, MARKER_PATH), 'utf8').trim();
  } catch (error) {
    if (error.code !== 'ENOENT') throw markerError(error.message, coreVersion);
  }
  if (!isExactStrapiVersion(appliedVersion)) throw markerError(appliedVersion, coreVersion);
  return appliedVersion;
}

/** @returns {string} */
export function checkStrapiVersions(repositoryRoot) {
  const coreVersion = validateStrapiVersions(repositoryRoot);
  const appliedVersion = readAppliedCodemodsVersion(repositoryRoot, coreVersion);
  if (appliedVersion !== coreVersion) {
    throw markerError(appliedVersion, coreVersion);
  }
  return coreVersion;
}
