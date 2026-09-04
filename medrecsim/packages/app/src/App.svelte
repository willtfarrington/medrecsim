<!-- SPDX-License-Identifier: MIT -->
<script lang="ts">
  import { ENGINE_PACKAGE } from '@medrecsim/engine';
  import Banner from './Banner.svelte';
</script>

<Banner />

<main>
  <h1>medrecsim</h1>
  <p>
    Hello, world. This is the toolchain hello-world (EP-8): a static, client-only page with no
    accounts, no telemetry, and no network requests after it loads. The first playable case arrives
    with the v0.1 vertical slice.
  </p>
  <p class="meta">Engine package wired: <code>{ENGINE_PACKAGE}</code></p>
  <p>
    Pre-release; under active construction; nothing here is validated. Source and plan:
    <a href="https://github.com/willtfarrington/medrecsim">github.com/willtfarrington/medrecsim</a>.
  </p>
</main>

<style>
  main {
    padding: 1rem;
    max-width: 80ch;
  }
  .meta {
    font-size: 0.9rem;
  }
</style>
