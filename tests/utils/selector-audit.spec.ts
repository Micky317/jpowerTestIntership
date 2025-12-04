import { test } from '@playwright/test';
import { signIn } from '@/utils';
import fs from 'fs';
import path from 'path';

// Audit only selectors that are used by utils/* helpers. When missing,
// include file references where the selector appears so the developer can
// quickly jump to usage sites.
test('selector audit - utils selectors', async ({ page }) => {
  const failures: Array<{ name: string; sel: string; usages: string[] }> = [];
  const base = String(process.env.BASE_URL || 'http://localhost:3000');

  // Define selectors that are used by utils/* (tweak as needed)
  const selectors: Array<{ name: string; sel: string; phase: 'prelogin' | 'postlogin' | 'client' }> = [
    { name: 'email input', sel: '#email', phase: 'prelogin' },
    { name: 'password input', sel: '#password', phase: 'prelogin' },
    { name: 'submit button', sel: '#submit', phase: 'prelogin' },

    { name: 'avatar', sel: '#avatar', phase: 'postlogin' },
    { name: 'settings', sel: '#settings', phase: 'postlogin' },
    { name: 'search input', sel: 'input#search', phase: 'postlogin' },
    { name: 'save button', sel: '#save', phase: 'postlogin' },
    { name: 'delete button', sel: '#delete', phase: 'postlogin' },
    { name: 'new button', sel: '#new', phase: 'postlogin' },
    { name: 'rowCount element', sel: '#rowCount', phase: 'postlogin' },

    { name: 'client name', sel: '#name', phase: 'client' },
    { name: 'client shortId', sel: '#shortId', phase: 'client' },
    { name: 'add contact', sel: '#addContact', phase: 'client' },
  ];

  // helper to search project files for usages of selector string
  const repoRoot = path.resolve(__dirname, '../../..');
  const findUsages = (needle: string) => {
    const results: string[] = [];
    const walk = (dir: string) => {
      for (const name of fs.readdirSync(dir)) {
        const fp = path.join(dir, name);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) {
          if (name === 'node_modules' || name === '.git') continue;
          walk(fp);
        } else if (stat.isFile() && /\.ts$|\.js$/.test(name)) {
          try {
            const content = fs.readFileSync(fp, 'utf8');
            if (content.includes(needle)) {
              // collect a small snippet: file:line
              const lines = content.split(/\r?\n/);
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(needle)) {
                  results.push(`${path.relative(repoRoot, fp)}:${i + 1}`);
                  if (results.length >= 5) break;
                }
              }
            }
          } catch (e) {
            // ignore read errors
          }
        }
        if (results.length >= 10) return;
      }
    };
    try {
      walk(repoRoot);
    } catch (e) {
      // ignore
    }
    return results;
  };

  // 1) Pre-login checks
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  for (const s of selectors.filter((x) => x.phase === 'prelogin')) {
    try {
      await page.locator(s.sel).waitFor({ state: 'visible', timeout: 3000 });
    } catch (e) {
      failures.push({ name: s.name, sel: s.sel, usages: findUsages(s.sel) });
    }
  }

  // If any prelogin selectors failed, stop early and report usages
  if (failures.length) {
    const lines = ['Selector audit (prelogin) found problems:'];
    for (const f of failures) {
      lines.push(`${f.name} -> ${f.sel}`);
      lines.push('  referenced in:');
      if (f.usages.length) lines.push(...f.usages.map((u) => `    - ${u}`));
      else lines.push('    - (no usages found in codebase)');
    }
    await page.screenshot({ path: 'selector-audit-failure-prelogin.png', fullPage: true }).catch(() => {});
    throw new Error(lines.join('\n'));
  }

  // 2) Post-login selectors: sign in and test
  try {
    await signIn(page);
  } catch (e: any) {
    throw new Error(`signIn failed: ${e?.message || e}`);
  }

  const postFailures: Array<{ name: string; sel: string; usages: string[] }> = [];
  for (const s of selectors.filter((x) => x.phase === 'postlogin')) {
    try {
      // If selector is inside avatar dropdown, try opening avatar first
      if (s.sel === '#settings') {
        try {
          await page.locator('#avatar').click();
        } catch (e) {
          // ignore
        }
      }
      await page.locator(s.sel).waitFor({ state: 'visible', timeout: 3000 });
    } catch (e) {
      postFailures.push({ name: s.name, sel: s.sel, usages: findUsages(s.sel) });
    }
  }

  // 3) client section selectors (navigate to /client)
  const clientFailures: Array<{ name: string; sel: string; usages: string[] }> = [];
  try {
    await page.goto(new URL('/client', base).toString());
    await page.waitForURL('**/client', { timeout: 5000 });
    for (const s of selectors.filter((x) => x.phase === 'client')) {
      try {
        await page.locator(s.sel).waitFor({ state: 'visible', timeout: 3000 });
      } catch (e) {
        clientFailures.push({ name: s.name, sel: s.sel, usages: findUsages(s.sel) });
      }
    }
  } catch (e) {
    // cannot open client page — include as failure for all client selectors
    for (const s of selectors.filter((x) => x.phase === 'client'))
      clientFailures.push({ name: s.name, sel: s.sel, usages: findUsages(s.sel) });
  }

  if (postFailures.length || clientFailures.length) {
    const lines = ['Selector audit found problems:'];
    if (postFailures.length) {
      lines.push('\nPost-login missing selectors:');
      for (const f of postFailures) {
        lines.push(`${f.name} -> ${f.sel}`);
        lines.push('  referenced in:');
        if (f.usages.length) lines.push(...f.usages.map((u) => `    - ${u}`));
        else lines.push('    - (no usages found in codebase)');
      }
    }
    if (clientFailures.length) {
      lines.push('\n/client missing selectors:');
      for (const f of clientFailures) {
        lines.push(`${f.name} -> ${f.sel}`);
        lines.push('  referenced in:');
        if (f.usages.length) lines.push(...f.usages.map((u) => `    - ${u}`));
        else lines.push('    - (no usages found in codebase)');
      }
    }
    await page.screenshot({ path: 'selector-audit-failure.png', fullPage: true }).catch(() => {});
    throw new Error(lines.join('\n'));
  }
});
