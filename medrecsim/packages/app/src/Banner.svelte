<!-- SPDX-License-Identifier: MIT -->
<script lang="ts">
  import { BANNER_LEAD, DISCLAIMER } from './disclaimer.ts';
</script>

<!--
  Persistent synthetic / no-affiliation banner (D-UX-006). Always rendered, never dismissible.
  Landmark + label so screen-reader users can jump to or past it; nothing here is colour-only.
-->
<section class="banner" aria-labelledby="banner-heading">
  <h2 id="banner-heading" class="banner__lead">{BANNER_LEAD}</h2>
  <p class="banner__text">{DISCLAIMER}</p>
</section>

<style>
  .banner {
    border-bottom: 3px solid #7a5c00;
    background: #fff4d6;
    color: #2b2100;
    padding: 0.75rem 1rem;
    line-height: 1.4;
  }
  .banner__lead {
    margin: 0 0 0.25rem;
    font-size: 1rem;
  }
  .banner__text {
    margin: 0;
    font-size: 0.9rem;
    max-width: 80ch;
  }
  @media (prefers-color-scheme: dark) {
    .banner {
      background: #3a2e00;
      color: #fff4d6;
      border-bottom-color: #e0b400;
    }
  }
</style>
