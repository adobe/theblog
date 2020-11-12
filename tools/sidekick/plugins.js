/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// This file contains the blog-specific plugins for the sidekick.
(() => {
  const sk = window.sidekick;
  if (typeof sk !== 'object') return;

  // sk.loadCSS();

  // TAGGER -----------------------------------------------------------------------

  sk.add({
    id: 'tagger',
    condition: (sidekick) => {
      return sidekick.isEditor();
    },
    button: {
      text: 'Tagger',
      action: () => {
        const { config } = sk;
        window.open(`https://${config.host}/tools/tagger/`, 'hlx-sidekick-tagger');
      },
    },
  });

  // PREVIEW ----------------------------------------------------------------------

  sk.add({
    id: 'preview',
    condition: (sidekick) => {
      return sidekick.isEditor() || sidekick.isHelix();
    },
    button: {
      text: 'Preview',
      action: () => {
        const { config, location } = sk;
        if (!config.innerHost) {
          sk.notify(`Preview is not configured for ${config.project}`, 0);
          return;
        }
        // check if host is a URL
        if (config.host && config.host.startsWith('http')) {
          config.host = new URL(config.host).host;
        }
      
        const currentHost = location.host;
        const currentPath = location.pathname;
      
        if (/.*\.sharepoint\.com/.test(currentHost)
          || currentHost === 'docs.google.com') {
          // source document, open window with staging url
          const u = new URL('https://adobeioruntime.net/api/v1/web/helix/helix-services/content-proxy@v1');
          u.search = new URLSearchParams([
            ['owner', config.owner],
            ['repo', config.repo],
            ['ref', config.ref || 'master'],
            ['path', '/'],
            ['lookup', location.href],
          ]).toString();
          window.open(u, `hlx-sidekick-${config.ref}--${config.repo}--${config.owner}`);
        } else {
          sk.showModal('Please wait...', true);
          switch (currentHost) {
            case config.innerHost:
            case config.outerHost:
                // staging, switch to production
              if (!config.host) {
                sk.notify(`Production host for ${config.project} is unknown`);
                return;
              }
              window.location.href = `https://${config.host}${currentPath.replace('/publish', '')}`;
              break;
            case config.host:
              // production, switch to staging4
              window.location.href = `https://${config.innerHost}${currentPath.replace(/^\/(.*)\/(\d{4})/, '/$1/publish/$2')}`;
              break;
            default:
              sk.hideModal();
              sk.notify(`<p>Preview can be used for ${config.project} here:</p>`
                `<p><ul><li>online document editors, or any page on<li>https://${config.innerHost}/${config.host ? `<li>https://${config.host}/` : ''}</ul><p>`, 2);
          }
        }
      },
    }
  });

  // PREDICTED URL ----------------------------------------------------------------

  function predictUrl(host, path) {
    const pathsplits = path.split('/');
    let datePath = '';
    if (window.blog && window.blog.rawDate) {
      const datesplits = window.blog.rawDate.split('-');
      if (datesplits.length > 2) {
        datePath = `/${datesplits[2]}/${datesplits[0]}/${datesplits[1]}`;
      }
    }
    const filename = (pathsplits[pathsplits.length-1].split('.')[0]).toLowerCase().replace(/[^a-z\d_\/\.]/g,'-');
    return `https://${host}/${pathsplits[1]}${datePath}/${filename}.html`;
  }
  
  sk.add({
    id: 'predicted-url',
    condition: (sidekick) => {
      const { config, location } = sidekick;
      return sidekick.isHelix() && config.host && location.host != config.host;
    },
    button: {
      text: 'Copy Predicted URL',
      action: (evt) => {
        const input = evt.target.previousSibling;
        input.select();
        document.execCommand('copy');
        sk.notify(`<p>Predicted URL copied to clipboard:</p><p>${input.value}</p>`);
      },
    },
    elements: [
      {
        tag: 'input',
        attrs: {
          style: 'position:absolute;top:-100px;', // place off screen
        },
      },
    ],
    callback: (sidekick, $plugin) => {
      const { config, location } = sidekick;
      // set predicted url as value of text field
      const url = predictUrl(config.host, location.pathname);
      $plugin.querySelector('input').value = url;
    }
  });

  // PUBLISH ----------------------------------------------------------------------

  async function sendPurge(cfg, path) {
    console.log(`purging ${path}`);
    const xfh = [
      cfg.host,
      cfg.outerHost,
    ];
    const u = new URL('https://adobeioruntime.net/api/v1/web/helix/helix-services/purge@v1');
    u.search = new URLSearchParams([
      ['host', cfg.innerHost],
      ['xfh', xfh.join(',')],
      ['path', path],
    ]).toString();
    const resp = await fetch(u, {
      method: 'POST'
    });
    const json = await resp.json();
    console.log(JSON.stringify(json));

    const ok = json.every(e => e.status === 'ok');

    if (!resp.ok || !ok) {
      sk.notify(`<p>Failed to purge ${path} from the cache. Please try again later.</p>`
        `<p>Status: ${resp.status}</p>`
        `<p>${JSON.stringify(json)}</p>`);
    }
    return json;
  }

  sk.add({
    id: 'publish',
    condition: (sidekick) => {
      return sidekick.isHelix() && !sidekick.location.pathname.includes('/drafts/');
    },
    button: {
      text: 'Publish',
      action: async () => {
        const { config, location } = sk;
        if (!config.innerHost || !config.host) {
          sk.notify(`Publish is not configured for ${config.project}`, 0);
          return;
        }
        sk.showModal('Publishing...', true);

        let path = location.pathname;

        await sendPurge(config, path);
        // also purge path without /publish segment
        if (path.includes('/publish/')) {
          path = path.replace('/publish/','/');
          console.log(`purging ${path}`)
          await sendPurge(config, path);
        }

        const outerURL = `https://${config.host}${path}`;
        await fetch(outerURL, {cache: 'reload', mode: 'no-cors'});
        console.log(`redirecting ${outerURL}`);
        window.location.href = outerURL;            
      },
    },
  });
})();
