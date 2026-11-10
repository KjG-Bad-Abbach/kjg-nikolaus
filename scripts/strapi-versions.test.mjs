import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { checkStrapiVersions, validateStrapiVersions } from './strapi-versions.mjs';

const installedUtilities = Object.fromEntries(
  ['bash', 'dirname', 'mktemp', 'tee', 'awk', 'rm', 'mv'].map((name) => {
    const result = spawnSync('which', [name], { encoding: 'utf8' });
    assert.equal(result.status, 0, `Installed fixture utility required: ${name}`);
    return [name, result.stdout.trim()];
  }),
);

/** @returns {void} */
function writeManifest(root, directory, manifest) {
  writeFileSync(join(root, directory, 'package.json'), JSON.stringify(manifest));
}

/** @returns {string} */
function createRepository(t, version) {
  const root = mkdtempSync(join(tmpdir(), 'strapi-versions-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of ['backend', 'frontend']) mkdirSync(join(root, directory));
  writeManifest(root, 'backend', {
    dependencies: { '@strapi/strapi': version, '@strapi/plugin-cloud': version },
    devDependencies: { '@strapi/types': version },
  });
  writeManifest(root, 'frontend', {
    dependencies: { '@strapi/client': version, unrelated: '^1.0.0' },
    devDependencies: { '@strapi/types': version },
  });
  writeFileSync(join(root, 'backend/.last-applied-codemods-version'), `${version}\n`);
  return root;
}

/** @returns {void} */
function assertAlignmentRecovery(error) {
  assert.ok(error.message.includes('intended exact'));
  assert.ok(error.message.includes('both manifests'));
  assert.ok(error.message.includes('affected lockfiles'));
  assert.ok(error.message.includes('repository root'));
  assert.ok(error.message.includes('pnpm --dir backend strapi:codemods'));
  assert.ok(error.message.includes('pnpm --dir backend strapi:check'));
  assert.doesNotMatch(error.message, /git restore|pnpm .* add |STRAPI_VERSION|security approval/);
}

/** @returns {string} */
function formatListing(codemods) {
  const rows = [
    ['N°', 'Version', 'Kind', 'Name', 'UID'],
    ...codemods.map(({ version, kind, uid }, index) => [
      String(index),
      version,
      kind,
      `Fixture ${kind}`,
      uid,
    ]),
  ];
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => row[index].length)) + 2);
  const border = (left, middle, right) =>
    `${left}${widths.map((width) => '─'.repeat(width)).join(middle)}${right}`;
  const row = (cells) =>
    `│${cells.map((cell, index) => ` ${cell.padEnd(widths[index] - 1)}`).join('│')}│`;
  return [
    border('┌', '┬', '┐'),
    row(rows[0]),
    border('├', '┼', '┤'),
    ...rows.slice(1).map(row),
    border('└', '┴', '┘'),
    '',
  ].join('\n');
}

const defaultCodemods = [{ version: '5.1.0', kind: 'json', uid: '5.1.0-fixture-json' }];
const emptyListing =
  '[INFO]\t[2026-11-10T00:00:00.000Z] Found no codemods matching >5.0.0 <=5.30.0\n';
const acquisitionPreamble =
  'Need to install the following packages:\n@strapi/upgrade@5.30.0\nOk to proceed? (y) ';

/** @returns {object} */
function createWorkflow(t, overrides) {
  const configuration = {
    coreVersion: '5.30.0',
    marker: '5.0.0\n',
    listing: formatListing(defaultCodemods),
    listStatus: 0,
    runStatus: 0,
    fileErrors: 0,
    listInput: false,
    runInput: false,
    mutation: null,
    signal: null,
    ...overrides,
  };
  const root = createRepository(t, configuration.coreVersion);
  const markerPath = join(root, 'backend/.last-applied-codemods-version');
  if (configuration.marker === null) rmSync(markerPath);
  else writeFileSync(markerPath, configuration.marker);
  const binPath = join(root, 'bin');
  mkdirSync(binPath);
  mkdirSync(join(root, 'scripts'));
  for (const file of ['apply-strapi-codemods.sh', 'strapi-versions.mjs']) {
    copyFileSync(new URL(file, import.meta.url), join(root, 'scripts', file));
  }
  for (const [name, path] of Object.entries({ node: process.execPath, ...installedUtilities })) {
    symlinkSync(path, join(binPath, name));
  }
  writeFileSync(join(root, 'configuration.json'), JSON.stringify(configuration));
  writeFileSync(
    join(binPath, 'npx'),
    String.raw`#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const root = ${JSON.stringify(root)};
const configuration = JSON.parse(fs.readFileSync(path.join(root, 'configuration.json'), 'utf8'));
const args = process.argv.slice(2);
const listing = args[2] === 'ls';
const invocation = { args, cwd: process.cwd() };
if (listing && configuration.listInput) {
  process.stdout.write('Need to install the following packages:\n' + args[0] + '\nOk to proceed? (y) ');
}
if (listing ? configuration.listInput : configuration.runInput) {
  const byte = Buffer.alloc(1);
  invocation.input = '';
  while (fs.readSync(0, byte, 0, 1, null) && byte[0] !== 10) invocation.input += byte.toString();
}
fs.appendFileSync(path.join(root, 'invocations.jsonl'), JSON.stringify(invocation) + '\n');
if (listing) {
  process.stdout.write(configuration.listing);
  process.exit(configuration.listStatus);
}
fs.writeFileSync(path.join(root, 'backend/partial-transform.json'), '{"changed":true}');
if (configuration.mutation === 'marker') {
  fs.writeFileSync(path.join(root, 'backend/.last-applied-codemods-version'), '5.2.0\n');
}
if (configuration.mutation === 'frontend' || configuration.mutation === 'core') {
  for (const directory of configuration.mutation === 'core' ? ['backend', 'frontend'] : ['frontend']) {
    const manifestPath = path.join(root, directory, 'package.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const section of ['dependencies', 'devDependencies']) {
      for (const name of Object.keys(manifest[section] || {})) {
        if (name.startsWith('@strapi/')) manifest[section][name] = '5.31.0';
      }
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  }
}
process.stdout.write('REPORT ' + args[3] + ': completed; file errors: ' + configuration.fileErrors + '\n');
process.stderr.write('REPORT diagnostic for ' + args[3] + '\n');
if (configuration.signal) process.kill(process.ppid, configuration.signal);
process.exit(configuration.runStatus);
`,
    { mode: 0o755 },
  );
  return { root, binPath, markerPath };
}

/** @returns {object} */
function runWorkflow(fixture, input) {
  const timeout_ms = 10_000;
  const result = spawnSync(
    installedUtilities.bash,
    [join(fixture.root, 'scripts/apply-strapi-codemods.sh')],
    {
      cwd: tmpdir(),
      input,
      encoding: 'utf8',
      env: { ...process.env, PATH: fixture.binPath, TMPDIR: fixture.root },
      timeout: timeout_ms,
    },
  );
  assert.ifError(result.error);
  const invocationPath = join(fixture.root, 'invocations.jsonl');
  return {
    ...result,
    output: result.stdout + result.stderr,
    invocations: existsSync(invocationPath)
      ? readFileSync(invocationPath, 'utf8').trim().split('\n').map(JSON.parse)
      : [],
    marker: existsSync(fixture.markerPath) ? readFileSync(fixture.markerPath, 'utf8') : null,
  };
}

/** @returns {void} */
function assertStopped(result, marker) {
  assert.notEqual(result.status, 0, result.output);
  assert.equal(result.marker, marker);
  assert.match(result.output, /marker.*not advanced/i);
}

/** @returns {void} */
function assertPartialWork(root) {
  assert.equal(
    readFileSync(join(root, 'backend/partial-transform.json'), 'utf8'),
    '{"changed":true}',
  );
}

/** @returns {void} */
function assertNoTemporaryMarker(root) {
  assert.deepEqual(
    readdirSync(join(root, 'backend')).filter((name) =>
      name.startsWith('.last-applied-codemods-version'),
    ),
    ['.last-applied-codemods-version'],
  );
}

for (const coreVersion of ['5.30.0', '5.31.0']) {
  test(`checkStrapiVersions_MatchingManifestsAndMarker_${coreVersion}_Expect_ReadOnlySuccess`, (t) => {
    // Arrange
    const root = createRepository(t, coreVersion);
    const paths = [
      'backend/package.json',
      'frontend/package.json',
      'backend/.last-applied-codemods-version',
    ];
    const before = paths.map((path) => readFileSync(join(root, path), 'utf8'));

    // Act
    const version = checkStrapiVersions(root);

    // Assert
    assert.equal(version, coreVersion);
    assert.deepEqual(
      paths.map((path) => readFileSync(join(root, path), 'utf8')),
      before,
    );
  });
}

for (const directory of ['backend', 'frontend']) {
  for (const section of ['dependencies', 'devDependencies']) {
    for (const version of ['^5.30.0', '~5.30.0', '5.31.0', 'workspace:*']) {
      test(`validateStrapiVersions_${directory}_${section}_${version}_Expect_ActionableFailure`, (t) => {
        // Arrange
        const root = createRepository(t, '5.30.0');
        const manifest = JSON.parse(readFileSync(join(root, directory, 'package.json'), 'utf8'));
        manifest[section]['@strapi/plugin-cloud'] = version;
        writeManifest(root, directory, manifest);

        // Act
        const validate = () => validateStrapiVersions(root);

        // Assert
        assert.throws(validate, (error) => {
          assert.ok(
            error.message.includes(`${directory}/package.json ${section}.@strapi/plugin-cloud`),
          );
          assert.ok(error.message.includes(JSON.stringify(version)));
          assert.ok(error.message.includes('expected exact "5.30.0"'));
          assertAlignmentRecovery(error);
          return true;
        });
      });
    }
  }
}

for (const version of [undefined, '^5.30.0', '05.30.0', '5.30', '5.30.0-01']) {
  test(`validateStrapiVersions_InvalidCore_${version}_Expect_ExactVersionFailure`, (t) => {
    // Arrange
    const root = createRepository(t, '5.30.0');
    writeManifest(root, 'backend', { dependencies: { '@strapi/strapi': version } });

    // Act
    const validate = () => validateStrapiVersions(root);

    // Assert
    assert.throws(validate, (error) => {
      assert.match(
        error.message,
        /backend\/package.json dependencies\.@strapi\/strapi.*exact SemVer/,
      );
      assertAlignmentRecovery(error);
      return true;
    });
  });
}

for (const [coreVersion, marker] of [
  ['5.30.0', null],
  ['5.30.0', ''],
  ['5.30.0', 'not-a-version'],
  ['5.30.0', '5.29.0'],
  ['5.31.0', '5.30.0'],
]) {
  test(`checkStrapiVersions_InvalidMarker_${coreVersion}_${marker}_Expect_SafeRecoveryInstructions`, (t) => {
    // Arrange
    const root = createRepository(t, coreVersion);
    const markerPath = join(root, 'backend/.last-applied-codemods-version');
    if (marker === null) rmSync(markerPath);
    else writeFileSync(markerPath, marker);

    // Act
    const check = () => checkStrapiVersions(root);

    // Assert
    assert.throws(check, (error) => {
      assert.ok(error.message.includes('backend/.last-applied-codemods-version'));
      assert.ok(error.message.includes(marker === null ? 'missing' : JSON.stringify(marker)));
      assert.ok(error.message.includes(`expected "${coreVersion}"`));
      assert.ok(error.message.includes('preserving local edits'));
      assert.ok(error.message.includes('repository root'));
      assert.doesNotMatch(error.message, /git restore/);
      assert.ok(error.message.includes('Do not manually advance'));
      assert.ok(error.message.includes('pnpm --dir backend strapi:check'));
      assert.ok(error.message.includes('pnpm --dir backend strapi:codemods'));
      return true;
    });
    assert.equal(validateStrapiVersions(root), coreVersion);
  });
}

for (const directory of ['backend', 'frontend']) {
  for (const contents of [null, '{']) {
    test(`validateStrapiVersions_${directory}_UnreadableManifest_${contents}_Expect_LocationAndRecovery`, (t) => {
      // Arrange
      const root = createRepository(t, '5.30.0');
      const path = join(root, directory, 'package.json');
      if (contents === null) rmSync(path);
      else writeFileSync(path, contents);

      // Act
      const validate = () => validateStrapiVersions(root);

      // Assert
      assert.throws(validate, (error) => {
        assert.ok(error.message.includes(`${directory}/package.json`));
        assert.ok(error.message.includes('preserving local edits'));
        assert.ok(error.message.includes('repository root'));
        assert.doesNotMatch(error.message, /git restore/);
        return true;
      });
    });
  }
}

for (const marker of ['5.30.0\n', '5.29.0\n']) {
  test(`checkCommand_Marker_${marker.trim()}_Expect_ExitStatusAndDiagnostic`, (t) => {
    // Arrange
    const root = createRepository(t, '5.30.0');
    mkdirSync(join(root, 'scripts'));
    for (const file of ['check-strapi-versions.mjs', 'strapi-versions.mjs']) {
      copyFileSync(new URL(file, import.meta.url), join(root, 'scripts', file));
    }
    writeFileSync(join(root, 'backend/.last-applied-codemods-version'), marker);

    // Act
    const result = spawnSync(process.execPath, [join(root, 'scripts/check-strapi-versions.mjs')], {
      cwd: tmpdir(),
      encoding: 'utf8',
    });

    // Assert
    const success = marker.trim() === '5.30.0';
    assert.equal(result.status, success ? 0 : 1);
    assert.match(success ? result.stdout : result.stderr, /5\.30\.0/);
    assert.equal(success ? result.stderr : result.stdout, '');
    if (!success) assert.match(result.stderr, /5\.29\.0/);
  });
}

for (const [coreVersion, appliedVersion, versions, listingSeparator] of [
  ['5.30.0', '5.0.0', ['5.1.0', '5.30.0'], ''],
  ['5.31.0', '5.30.0', ['5.31.0'], '\n'],
]) {
  test(`applyCommand_PendingInterval_${coreVersion}_Expect_PinnedCommandsAndEverySelectedUid`, (t) => {
    // Arrange
    const codemods = versions.flatMap((version) =>
      ['code', 'json'].map((kind) => ({ version, kind, uid: `${version}-fixture-${kind}` })),
    );
    const listing = formatListing(codemods);
    const fixture = createWorkflow(t, {
      coreVersion,
      marker: `${appliedVersion}\n`,
      listing: listingSeparator + listing.replace(/│/g, '\x1b[36m│\x1b[0m'),
      listInput: true,
      runInput: true,
    });
    const input = ['y', 'yes'];
    for (const { uid } of codemods) input.push(`download-${uid}`, 'y');
    input.push('yes');

    // Act
    const result = runWorkflow(fixture, `${input.join('\n')}\n`);

    // Assert
    assert.equal(result.status, 0, result.output);
    assert.equal(result.marker, `${coreVersion}\n`);
    assert.deepEqual(result.invocations, [
      {
        args: [
          `@strapi/upgrade@${coreVersion}`,
          'codemods',
          'ls',
          '--range',
          `>${appliedVersion} <=${coreVersion}`,
        ],
        cwd: join(fixture.root, 'backend'),
        input: 'y',
      },
      ...codemods.map(({ uid }) => ({
        args: [`@strapi/upgrade@${coreVersion}`, 'codemods', 'run', uid],
        cwd: join(fixture.root, 'backend'),
        input: `download-${uid}`,
      })),
    ]);
    const selectionStart = result.stdout.indexOf('Complete selected codemods');
    const selectionEnd = result.stdout.indexOf('Run every selected codemod?');
    assert.ok(selectionStart >= 0 && selectionEnd > selectionStart, result.stdout);
    assert.ok(
      result.stdout.includes(
        `Need to install the following packages:\n@strapi/upgrade@${coreVersion}\nOk to proceed? (y) `,
      ),
    );
    assert.match(result.stdout, /Record completion at/);
    const selection = result.stdout.slice(selectionStart, selectionEnd);
    for (const { uid } of codemods) {
      assert.ok(selection.includes(uid), selection);
      assert.ok(result.stdout.includes(`REPORT ${uid}: completed; file errors: 0`));
      assert.ok(result.stderr.includes(`REPORT diagnostic for ${uid}`));
    }
    assert.equal((result.stdout.match(/zero per-file errors/g) || []).length, codemods.length);
    assert.equal(checkStrapiVersions(fixture.root), coreVersion);
    assert.equal(existsSync(join(fixture.root, 'backend/node_modules')), false);
  });
}

for (const input of ['no\n', '']) {
  test(`applyCommand_Selection_${input ? 'Declined' : 'Eof'}_Expect_NoRunsOrMarkerUpdate`, (t) => {
    // Arrange
    const fixture = createWorkflow(t, {});

    // Act
    const result = runWorkflow(fixture, input);

    // Assert
    assertStopped(result, '5.0.0\n');
    assert.equal(result.invocations.length, 1);
    assert.equal(existsSync(join(fixture.root, 'backend/partial-transform.json')), false);
  });
}

for (const [name, runStatus, answers, succeeds] of [
  ['unconfirmed-stop', 0, ['yes', 'no', 'no'], false],
  ['unconfirmed-continue-resolved', 0, ['yes', 'no', 'yes', 'yes', 'yes'], true],
  ['unconfirmed-attestation-denied', 0, ['yes', 'no', 'yes', 'no'], false],
  ['unconfirmed-attestation-eof', 0, ['yes', 'no', 'yes'], false],
  ['resolved-final-denied', 0, ['yes', 'no', 'yes', 'yes', 'no'], false],
  ['resolved-final-eof', 0, ['yes', 'no', 'yes', 'yes'], false],
  ['verification-eof', 0, ['yes'], false],
  ['continue-eof', 0, ['yes', 'no'], false],
  ['final-denied', 0, ['yes', 'yes', 'no'], false],
  ['final-eof', 0, ['yes', 'yes'], false],
  ['nonzero-stop', 2, ['yes', 'yes', 'no'], false],
  ['nonzero-continue-eof', 2, ['yes', 'yes'], false],
  ['nonzero-continue-resolved', 2, ['yes', 'yes', 'yes', 'yes', 'yes'], true],
  ['nonzero-attestation-denied', 2, ['yes', 'yes', 'yes', 'no'], false],
]) {
  test(`applyCommand_Run_${name}_Expect_ExplicitRecoveryAndPreservedPartialWork`, (t) => {
    // Arrange
    const fixture = createWorkflow(t, {
      runStatus,
      fileErrors: name.startsWith('unconfirmed') ? 1 : 0,
    });

    // Act
    const result = runWorkflow(fixture, `${answers.join('\n')}\n`);

    // Assert
    if (succeeds) {
      assert.equal(result.status, 0, result.output);
      assert.equal(result.marker, '5.30.0\n');
    } else assertStopped(result, '5.0.0\n');
    assert.equal(result.invocations.length, 2);
    assert.match(result.stdout, /REPORT 5\.1\.0-fixture-json: completed; file errors: [01]/);
    assert.match(result.stderr, /REPORT diagnostic for 5\.1\.0-fixture-json/);
    assert.match(result.stdout, /Verify .*zero per-file errors/);
    if (runStatus) {
      assert.ok(result.stderr.includes('\x1b[31mWARNING:'));
      assert.match(result.stderr, /exited 2/);
      assert.ok(result.stderr.includes('\x1b[0m'));
    } else assert.ok(!result.stderr.includes('\x1b[31m'));
    assertPartialWork(fixture.root);
  });
}

for (const resolved of [true, false]) {
  test(`applyCommand_UnconfirmedThenVerified_Resolved_${resolved}_Expect_PersistentRecoveryAttestation`, (t) => {
    // Arrange
    const codemods = ['code', 'json'].map((kind) => ({
      version: '5.1.0',
      kind,
      uid: `5.1.0-fixture-${kind}`,
    }));
    const fixture = createWorkflow(t, { listing: formatListing(codemods) });
    const answers = ['y', 'no', 'y', 'yes', resolved ? 'yes' : 'no', 'yes'];

    // Act
    const result = runWorkflow(fixture, `${answers.join('\n')}\n`);

    // Assert
    assert.equal(result.invocations.length, 3);
    assert.deepEqual(
      result.invocations.slice(1).map(({ args }) => args[3]),
      codemods.map(({ uid }) => uid),
    );
    assert.match(result.stdout, /Have ALL failures and unconfirmed results been resolved/);
    if (resolved) {
      assert.equal(result.status, 0, result.output);
      assert.equal(result.marker, '5.30.0\n');
    } else assertStopped(result, '5.0.0\n');
  });
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  test(`applyCommand_Interrupted_${signal}_Expect_NoPublicationOrFurtherRuns`, (t) => {
    // Arrange
    const codemods = ['code', 'json'].map((kind) => ({
      version: '5.1.0',
      kind,
      uid: `5.1.0-fixture-${kind}`,
    }));
    const fixture = createWorkflow(t, { signal, listing: formatListing(codemods) });

    // Act
    const result = runWorkflow(fixture, 'yes\nyes\nyes\nyes\n');

    // Assert
    assertStopped(result, '5.0.0\n');
    assert.equal(result.invocations.length, 2);
    assert.equal(result.invocations[1].args[3], codemods[0].uid);
    assert.doesNotMatch(result.stdout, /Record completion/);
    assertPartialWork(fixture.root);
    assertNoTemporaryMarker(fixture.root);
  });
}

for (const listInput of [false, true]) {
  for (const [input, succeeds] of [
    ['y\n', true],
    ['no\n', false],
    ['', false],
  ]) {
    test(`applyCommand_EmptyList_Acquisition_${listInput}_${succeeds ? 'Confirmed' : input ? 'Declined' : 'Eof'}_Expect_OnlyFinalConfirmation`, (t) => {
      // Arrange
      const fixture = createWorkflow(t, { listing: emptyListing, listInput });

      // Act
      const result = runWorkflow(fixture, `${listInput ? 'y\n' : ''}${input}`);

      // Assert
      assert.equal(result.invocations.length, 1);
      if (listInput) {
        assert.equal(result.invocations[0].input, 'y');
        assert.ok(result.stdout.includes('Ok to proceed? (y) '));
      }
      assert.doesNotMatch(result.stdout, /Run every selected|Verify |Have ALL/);
      assert.match(result.stdout, /Record completion at 5\.30\.0/);
      if (succeeds) {
        assert.equal(result.status, 0, result.output);
        assert.equal(result.marker, '5.30.0\n');
      } else assertStopped(result, '5.0.0\n');
    });
  }
}

for (const marker of [null, '', 'invalid', '^5.0.0', '5.0.0-beta.1', '5.31.0', '5.100.0']) {
  test(`applyCommand_InvalidBaseline_${marker}_Expect_NoNpxOrMarkerWrite`, (t) => {
    // Arrange
    const fixture = createWorkflow(t, { marker });

    // Act
    const result = runWorkflow(fixture, 'yes\nyes\nyes\n');

    // Assert
    assertStopped(result, marker);
    assert.deepEqual(result.invocations, []);
    assert.match(result.output, /backend\/\.last-applied-codemods-version/);
  });
}

for (const invalidCore of [undefined, '^5.30.0', '5.30.0-beta.1']) {
  test(`applyCommand_InvalidCore_${invalidCore}_Expect_NoNpxOrMarkerWrite`, (t) => {
    // Arrange
    const fixture = createWorkflow(t, {});
    writeManifest(fixture.root, 'backend', { dependencies: { '@strapi/strapi': invalidCore } });

    // Act
    const result = runWorkflow(fixture, 'yes\nyes\nyes\n');

    // Assert
    assertStopped(result, '5.0.0\n');
    assert.deepEqual(result.invocations, []);
    assert.match(result.output, /backend\/package.json dependencies\.@strapi\/strapi/);
  });
}

test('applyCommand_FrontendMismatch_Expect_NoNpxOrMarkerWrite', (t) => {
  // Arrange
  const fixture = createWorkflow(t, {});
  writeManifest(fixture.root, 'frontend', { devDependencies: { '@strapi/types': '5.31.0' } });

  // Act
  const result = runWorkflow(fixture, 'yes\nyes\nyes\n');

  // Assert
  assertStopped(result, '5.0.0\n');
  assert.deepEqual(result.invocations, []);
  assert.match(result.output, /frontend\/package.json devDependencies\.@strapi\/types/);
});

for (const coreVersion of ['5.30.0', '5.31.0']) {
  test(`applyCommand_CurrentMarker_${coreVersion}_Expect_ReadOnlySuccessWithoutNpx`, (t) => {
    // Arrange
    const fixture = createWorkflow(t, { coreVersion, marker: `${coreVersion}\n` });
    const before = ['backend/package.json', 'frontend/package.json'].map((path) =>
      readFileSync(join(fixture.root, path), 'utf8'),
    );

    // Act
    const result = runWorkflow(fixture, '');

    // Assert
    assert.equal(result.status, 0, result.output);
    assert.equal(result.marker, `${coreVersion}\n`);
    assert.deepEqual(result.invocations, []);
    assert.match(result.stdout, /up to date/);
    assert.deepEqual(
      ['backend/package.json', 'frontend/package.json'].map((path) =>
        readFileSync(join(fixture.root, path), 'utf8'),
      ),
      before,
    );
  });
}

for (const [name, listing, listStatus] of [
  ['nonzero', formatListing(defaultCodemods), 2],
  ['missing', '', 0],
  ['unknown-log', '[INFO] Found codemods\n', 0],
  ['unknown-prefix', `unexpected\n${formatListing(defaultCodemods)}`, 0],
  [
    'wrong-acquisition-package',
    acquisitionPreamble.replace('5.30.0', '5.31.0') + formatListing(defaultCodemods),
    0,
  ],
  [
    'missing-acquisition-prompt',
    acquisitionPreamble.replace('Ok to proceed? (y) ', '') + formatListing(defaultCodemods),
    0,
  ],
  [
    'acquisition-truncated-list',
    acquisitionPreamble + formatListing(defaultCodemods).split('\n').slice(0, -2).join('\n'),
    0,
  ],
  [
    'acquisition-conflicting-list',
    acquisitionPreamble + formatListing(defaultCodemods) + emptyListing,
    0,
  ],
  ['extra-output', `${formatListing(defaultCodemods)}unexpected\n`, 0],
  ['ambiguous', `${formatListing(defaultCodemods)}${emptyListing}`, 0],
  ['duplicate', formatListing([...defaultCodemods, ...defaultCodemods]), 0],
  ['truncated', formatListing(defaultCodemods).split('\n').slice(0, -2).join('\n'), 0],
  ['wrong-header', formatListing(defaultCodemods).replace('UID', 'Key'), 0],
  ['missing-uid', formatListing(defaultCodemods).replace(defaultCodemods[0].uid, ''), 0],
  ['wrong-index', formatListing(defaultCodemods).replace('│ 0 ', '│ 1 '), 0],
  ['empty-table', formatListing([]), 0],
  ['wrong-empty-range', emptyListing.replace('>5.0.0', '>5.1.0'), 0],
  ['unsafe-uid', formatListing([{ ...defaultCodemods[0], uid: '5.1.0-$(node)-json' }]), 0],
]) {
  test(`applyCommand_Listing_${name}_Expect_FailClosedWithoutRuns`, (t) => {
    // Arrange
    const fixture = createWorkflow(t, { listing, listStatus });

    // Act
    const result = runWorkflow(fixture, 'yes\nyes\nyes\n');

    // Assert
    assertStopped(result, '5.0.0\n');
    assert.equal(result.invocations.length, 1);
    assert.match(result.output, listStatus ? /listing failed/i : /ambiguous.*listing/i);
    assert.doesNotMatch(result.stdout, /Run every selected|Verify |Record completion/);
    assert.equal(existsSync(join(fixture.root, 'backend/partial-transform.json')), false);
  });
}

for (const mutation of ['frontend', 'core', 'marker']) {
  test(`applyCommand_FinalRevalidation_${mutation}_Expect_NoPublicationOrRollback`, (t) => {
    // Arrange
    const fixture = createWorkflow(t, { mutation });

    // Act
    const result = runWorkflow(fixture, 'yes\nyes\nyes\n');

    // Assert
    assertStopped(result, mutation === 'marker' ? '5.2.0\n' : '5.0.0\n');
    assert.equal(result.invocations.length, 2);
    assert.match(result.stdout, /Record completion at 5\.30\.0/);
    if (mutation !== 'marker') {
      const manifest = JSON.parse(
        readFileSync(join(fixture.root, 'frontend/package.json'), 'utf8'),
      );
      assert.equal(manifest.dependencies['@strapi/client'], '5.31.0');
    }
    assertPartialWork(fixture.root);
    assertNoTemporaryMarker(fixture.root);
  });
}

test('applyCommand_AtomicRenameFailure_Expect_OriginalMarkerAndTemporaryFileCleanup', (t) => {
  // Arrange
  const fixture = createWorkflow(t, {});
  const mvPath = join(fixture.binPath, 'mv');
  rmSync(mvPath);
  writeFileSync(
    mvPath,
    String.raw`#!${process.execPath}
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.writeFileSync(${JSON.stringify(join(fixture.root, 'rename.json'))}, JSON.stringify({
  args, contents: fs.readFileSync(args[args.length - 2], 'utf8'),
}));
process.stderr.write('Simulated atomic rename failure\n');
process.exit(1);
`,
    { mode: 0o755 },
  );

  // Act
  const result = runWorkflow(fixture, 'yes\nyes\nyes\n');

  // Assert
  assertStopped(result, '5.0.0\n');
  assert.match(result.stderr, /Simulated atomic rename failure/);
  const rename = JSON.parse(readFileSync(join(fixture.root, 'rename.json'), 'utf8'));
  const [source, target] = rename.args.slice(-2);
  assert.notEqual(source, fixture.markerPath);
  assert.equal(dirname(source), dirname(fixture.markerPath));
  assert.equal(target, fixture.markerPath);
  assert.equal(rename.contents, '5.30.0\n');
  assert.equal(existsSync(source), false);
  assertPartialWork(fixture.root);
  assertNoTemporaryMarker(fixture.root);
});
