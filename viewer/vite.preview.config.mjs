import { readFileSync } from 'node:fs';

const audioFocusSource = readFileSync(new URL('./audio-focus.js', import.meta.url), 'utf8');

export default {
  plugins: [{
    name: 'beetbox-audio-focus',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<head([^>]*)>/i, `$&\n<script data-beetbox-audio-focus>\n${audioFocusSource}\n</script>`);
      }
    }
  }]
};
