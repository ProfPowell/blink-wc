import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/test/test-page.html');
  await page.waitForFunction(() => customElements.get('blink-wc') !== undefined);
});

test.describe('Basic Functionality', () => {
  test('upgrades and is defined', async ({ page }) => {
    const defined = await page.evaluate(() => customElements.get('blink-wc') !== undefined);
    expect(defined).toBe(true);
  });

  test('builds internal structure (.blink-content)', async ({ page }) => {
    const el = page.locator('#default');
    await expect(el.locator('.blink-content')).toHaveCount(1);
    await expect(el.locator('.blink-content')).toBeVisible();
  });

  test('marks itself ready via data-ready', async ({ page }) => {
    await expect(page.locator('#default')).toHaveAttribute('data-ready', '');
  });

  test('reflects defaults to data-* hooks', async ({ page }) => {
    const el = page.locator('#default');
    await expect(el).toHaveAttribute('data-behavior', 'blink');
    await expect(el).toHaveAttribute('data-state', 'running');
  });

  test('applies the blink animation to the content', async ({ page }) => {
    const name = await page.evaluate(
      () => getComputedStyle(document.querySelector('#default .blink-content')).animationName
    );
    expect(name).toBe('blink-wc-blink');
  });
});

test.describe('Attributes and getters', () => {
  test('default getters return documented defaults', async ({ page }) => {
    const values = await page.evaluate(() => {
      const el = document.getElementById('default');
      return {
        rate: el.rate,
        behavior: el.behavior,
        minOpacity: el.minOpacity,
        count: el.count,
        playState: el.playState,
        mode: el.mode,
        unit: el.unit,
      };
    });
    expect(values).toEqual({
      rate: '1s',
      behavior: 'blink',
      minOpacity: null,
      count: 'infinite',
      playState: 'running',
      mode: '',
      unit: 'letter',
    });
  });

  test('pulse behavior is reflected and applied', async ({ page }) => {
    await expect(page.locator('#pulse')).toHaveAttribute('data-behavior', 'pulse');
    const name = await page.evaluate(
      () => getComputedStyle(document.querySelector('#pulse .blink-content')).animationName
    );
    expect(name).toBe('blink-wc-pulse');
  });
});

test.describe('Programmatic API', () => {
  test('stop() pauses and start() resumes', async ({ page }) => {
    const el = page.locator('#ctrl');
    // Keep it on-screen so the off-screen pause doesn't mask the play-state.
    await el.scrollIntoViewIfNeeded();
    await expect(el).toHaveAttribute('data-visible', 'true');
    const playState = () =>
      page.evaluate(
        () => getComputedStyle(document.querySelector('#ctrl .blink-content')).animationPlayState
      );
    await page.evaluate(() => document.getElementById('ctrl').stop());
    await expect(el).toHaveAttribute('data-state', 'paused');
    // The animation must actually be paused, not just the attribute.
    expect(await playState()).toBe('paused');
    await page.evaluate(() => document.getElementById('ctrl').start());
    await expect(el).toHaveAttribute('data-state', 'running');
    expect(await playState()).toBe('running');
  });

  test('toggle() flips play state', async ({ page }) => {
    const el = page.locator('#ctrl');
    const before = await el.getAttribute('data-state');
    await page.evaluate(() => document.getElementById('ctrl').toggle());
    const after = await el.getAttribute('data-state');
    expect(after).not.toBe(before);
  });
});

test.describe('Events', () => {
  test('emits blink-pause and blink-start on state change', async ({ page }) => {
    const events = await page.evaluate(async () => {
      const el = document.getElementById('ctrl');
      const seen = [];
      el.addEventListener('blink-pause', () => seen.push('pause'));
      el.addEventListener('blink-start', () => seen.push('start'));
      el.stop();
      el.start();
      await new Promise((r) => requestAnimationFrame(r));
      return seen;
    });
    expect(events).toContain('pause');
    expect(events).toContain('start');
  });
});

test.describe('Letter modes', () => {
  test('mode="wave" splits text into staggered .blink-char spans', async ({ page }) => {
    const el = page.locator('#wave');
    await expect(el).toHaveAttribute('data-split', '');
    const chars = el.locator('.blink-char');
    const count = await chars.count();
    expect(count).toBe('catch the wave'.length);

    const info = await chars.first().evaluate((node) => ({
      i: getComputedStyle(node).getPropertyValue('--i').trim(),
      animation: getComputedStyle(node).animationName,
    }));
    expect(info.i).toBe('0');
    expect(info.animation).toBe('blink-wc-blink');
  });

  test('switching away from a letter mode removes the char spans', async ({ page }) => {
    await page.evaluate(() => document.getElementById('wave').setAttribute('mode', 'neon'));
    const el = page.locator('#wave');
    await expect(el).not.toHaveAttribute('data-split', '');
    const count = await el.locator('.blink-char').count();
    expect(count).toBe(0);
  });

  test('twinkle gives each unit its own random clock', async ({ page }) => {
    const rate = await page
      .locator('#twinkle .blink-char')
      .first()
      .evaluate((node) => getComputedStyle(node).getPropertyValue('--rate').trim());
    expect(rate).not.toBe('');
  });
});

test.describe('Morse mode', () => {
  test('exposes the dot/dash string and blinks via data-lit', async ({ page }) => {
    const el = page.locator('#morse');
    // SOS = ... --- ...
    await expect(el).toHaveAttribute('data-morse', '... --- ...');
    // The RAF loop toggles data-lit between true and false.
    await expect
      .poll(() => page.evaluate(() => document.getElementById('morse').dataset.lit === 'true'), {
        timeout: 5000,
      })
      .toBe(true);
  });
});

test.describe('Step engine', () => {
  test('mode="extrude" cycles data-step between 0 and 1', async ({ page }) => {
    const el = page.locator('#extrude');
    await el.scrollIntoViewIfNeeded();
    await expect(el).toHaveAttribute('data-step', /[01]/);
    // The driver advances the step over time.
    await expect
      .poll(() => page.evaluate(() => document.getElementById('extrude').dataset.step === '1'), {
        timeout: 5000,
      })
      .toBe(true);
    // It does not split into per-letter spans.
    expect(await el.locator('.blink-char').count()).toBe(0);
  });

  test('morph defaults to 4 steps and reports it via the getter', async ({ page }) => {
    await page.locator('#morph').scrollIntoViewIfNeeded();
    const steps = await page.evaluate(() => document.getElementById('morph').steps);
    expect(steps).toBe(4);
    // It eventually reaches the highest step index (3).
    await expect
      .poll(() => page.evaluate(() => document.getElementById('morph').dataset.step === '3'), {
        timeout: 5000,
      })
      .toBe(true);
  });

  test('the step driver freezes while paused', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById('extrude');
      el.scrollIntoView();
      el.stop();
    });
    await page.waitForTimeout(150);
    const a = await page.evaluate(() => document.getElementById('extrude').dataset.step);
    await page.waitForTimeout(600);
    const b = await page.evaluate(() => document.getElementById('extrude').dataset.step);
    expect(a).toBe(b);
  });
});

test.describe('Accessibility', () => {
  test('respects reduced motion preference (animation disabled)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/test/test-page.html');
    await page.waitForFunction(() => customElements.get('blink-wc') !== undefined);
    const info = await page.evaluate(() => {
      const content = document.querySelector('#default .blink-content');
      const cs = getComputedStyle(content);
      return { animationName: cs.animationName, opacity: cs.opacity };
    });
    expect(info.animationName).toBe('none');
    expect(info.opacity).toBe('1');
    await context.close();
  });
});
