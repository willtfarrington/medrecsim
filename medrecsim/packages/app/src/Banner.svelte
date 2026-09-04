<!-- SPDX-License-Identifier: MIT -->
<script lang="ts">
  import { BANNER_LEAD, DISCLAIMER } from './disclaimer.ts';
</script>

<!--
  Persistent synthetic / no-affiliation banner (D-UX-006). Always rendered, never dismissible.
  Landmark + label so screen-reader users can jump to or past it; nothing here is colour-only.
  Colours come from the notice tokens (docs/design/COMPONENT-SPECS.md §1).
-->
<section class="banner" aria-labelledby="banner-heading">
  <h2 id="banner-heading" class="banner__lead">{BANNER_LEAD}</h2>
  <p class="banner__text">{DISCLAIMER}</p>
</section>

<style>
  .banner {
    border-bottom: var(--border-width-strong) solid var(--color-notice-border);
    background: var(--color-notice-bg);
    color: var(--color-notice-ink);
    padding: var(--space-3) var(--space-4);
    line-height: var(--leading-base);
  }
  .banner__lead {
    margin: 0 0 var(--space-1);
    font-size: var(--text-md);
    font-weight: var(--weight-bold);
  }
  .banner__text {
    margin: 0;
    font-size: var(--text-sm);
    max-width: 80ch;
  }
</style>
