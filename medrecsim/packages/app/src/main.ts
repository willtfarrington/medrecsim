// SPDX-License-Identifier: MIT
import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app');
if (target === null) {
  throw new Error('Mount point #app not found');
}

mount(App, { target });
