// SPDX-License-Identifier: MIT
import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App.svelte';
import { DISCLAIMER } from './disclaimer.ts';

describe('App', () => {
  let target: HTMLElement;
  let app: ReturnType<typeof mount>;

  afterEach(() => {
    unmount(app);
    target.remove();
  });

  it('renders the persistent synthetic / no-affiliation banner with the full disclaimer', () => {
    target = document.createElement('div');
    document.body.append(target);
    app = mount(App, { target });
    flushSync();

    const banner = target.querySelector('section[aria-labelledby="banner-heading"]');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain(DISCLAIMER);
    expect(target.querySelector('h1')?.textContent).toBe('medrecsim');
  });
});
