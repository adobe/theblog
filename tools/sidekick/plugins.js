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
  const sk = window.hlx ? window.hlx.sidekick : window.hlxSidekick;
  if (typeof sk !== 'object') return;

  // sk.loadCSS();

  // EDIT -------------------------------------------------------------------------

  sk.add({
    id: 'edit',
    condition: (sidekick) => sidekick.isHelix(),
    override: true,
    button: {
      action: () => {
        const { config, location } = sk;
        const href = location.href
          .split('#')[0] // remove anchor
          .split('?')[0] // remove query string
          .replace(/\/([a-z]{2})\/(\d{4})/, '/$1/publish/$2'); // remove /publish/
        const url = new URL('https://adobeioruntime.net/api/v1/web/helix/helix-services/content-proxy@v2');
        url.search = new URLSearchParams([
          ['owner', config.owner],
          ['repo', config.repo],
          ['ref', config.ref || 'main'],
          ['path', '/'],
          ['edit', href],
        ]).toString();
        window.open(url, `hlx-sk-edit-${btoa(location.href)}`);
      },
    },
  });

  // PREVIEW ----------------------------------------------------------------------

  sk.add({
    id: 'preview',
    condition: (sidekick) => sidekick.config.innerHost
      && (sk.isEditor() || sk.isHelix()),
    override: true,
    button: {
      action: () => {
        const { config, location } = sk;
        let url;
        if (sk.isEditor()) {
          url = new URL('https://adobeioruntime.net/api/v1/web/helix/helix-services/content-proxy@v2');
          url.search = new URLSearchParams([
            ['owner', config.owner],
            ['repo', config.repo],
            ['ref', config.ref || 'main'],
            ['path', '/'],
            ['lookup', location.href],
          ]).toString();
        } else if (location.host === config.innerHost) {
          // inner to outer -> remove /publish/
          url = new URL(`https://${config.host}${location.pathname.replace('/publish/', '/')}`);
        } else {
          // outer to inner -> add /publish/
          url = new URL(`https://${config.innerHost}${location.pathname.replace(/^\/([a-z]{2})\/(\d{4})/, '/$1/publish/$2')}`);
        }
        window.open(url.toString(), `hlx-sk-preview-${btoa(location.href)}`);
      },
    },
  });


  // TAGGER -----------------------------------------------------------------------

  sk.add({
    id: 'tagger',
    condition: (sk) => sk.isEditor() && (sk.location.search.includes('.docx&') || sk.location.search.includes('.md&')),
    button: {
      text: 'Tagger',
      action: () => {
        const { config } = sk;
        window.open(`https://${config.host}/tools/tagger/`, 'hlx-sidekick-tagger');
      },
    },
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
    return `${host ? `https://${host}/` : ''}${pathsplits[1]}${datePath}/${filename}.html`;
  }
  
  sk.add({
    id: 'predicted-url',
    condition: (sidekick) => {
      const { config, location } = sidekick;
      return sidekick.isHelix()
        && window.blog.pageType === window.blog.TYPE.POST
        && config.host
        && location.host != config.host;
    },
    button: {
      text: 'Copy Predicted URL',
      action: (evt) => {
        const { config, location } = sk;
        const url = predictUrl(config.host, location.pathname);
        navigator.clipboard.writeText(url);
        sk.notify([
          'Predicted URL copied to clipboard:',
          url,
        ]);
      },
    },
  });

  // CARD PREVIEW -------------------------------------------------------------------

  function getCardData() {
    const d = getArticleData();
    return {
      author: d[0],
      date: d[1],
      hero: d[2],
      path: window.location.pathname.substring(1),
      teaser: d[6],
      title: d[7],
      topics: [...window.blog.allVisibleTopics],
    };
  }

  sk.add({
    id: 'card-preview',
    condition: (sidekick) => {
      return sidekick.isHelix() && window.blog.pageType === window.blog.TYPE.POST;
    },
    button: {
      text: 'Card Preview',
      action: async (evt) => {
        const {
          addCard,
          itemTransformer,
        } = await import('/scripts/common.js');
        const sk = window.hlxSidekick;
        const btn = evt.target;
        let $modal = document.querySelector('.hlx-sk-overlay > div > .card');
        if ($modal) {
          sk.hideModal();
          btn.classList.remove('pressed');
        } else {
          sk.showModal('', true);
          $modal = document.querySelector('.hlx-sk-overlay > div');
          $modal.classList.remove('wait');
          $modal.innerHTML = addCard(await itemTransformer(getCardData()),
            document.createDocumentFragment()).outerHTML;
          function hideCardPreview() {
            sk.hideModal();
            btn.classList.remove('pressed');
          }
          $modal.parentElement.onclick = (evt) => {
            hideCardPreview();
            evt.target.onclick = null;
          };
          document.body.onkeydown = (evt) => {
            if (evt.key === 'Escape') {
              hideCardPreview();
              evt.target.onkeydown = null;
            }
          };
        
          const style = document.createElement('style');
          style.textContent = `
          .hlx-sk-overlay .card {
            box-shadow: var(--hlx-sk-shadow);
          }
          .hlx-sk-overlay > div {
            text-align: center;
            background-color: transparent;
            box-shadow: none;
          }`;
          $modal.appendChild(style);
          btn.classList.add('pressed');
        }
      },
    },
  });

  // ARTICLE DATA -------------------------------------------------------------------

  function getArticleData() {
    return [
      window.blog.author,
      new Date(window.blog.date).getTime()/1000,
      `/hlx_${document.head.querySelector('meta[property="og:image"]')
        .getAttribute('content').split('/hlx_')[1]}`,
      predictUrl(null, sk.location.pathname),
      `["${window.blog.products.join('\", \"')}"]`,
      '0',
      document.querySelector('main>div:nth-of-type(4)').textContent.trim().substring(0, 75),
      document.title,
      `["${window.blog.topics.join('\", \"')}"]`,
    ];
  }

  sk.add({
    id: 'article-data',
    condition: (sidekick) => {
      return sidekick.isHelix() && window.blog.pageType === window.blog.TYPE.POST;
    },
    button: {
      text: 'Copy Article Data',
      action: async () => {
        try {
          navigator.clipboard.writeText(getArticleData().join('\t'));
          sk.notify('Article data copied to clipboard');
        } catch (e) {
          sk.notify([
            'Unable to copy article data:',
            e,
          ], 0);
        }
      },
    },
  });

  // PUBLISH ----------------------------------------------------------------------

  async function sendPurge(cfg, path) {
    /* eslint-disable no-console */
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
      method: 'POST',
    });
    const json = await resp.json();
    console.log(JSON.stringify(json));
    /* eslint-enable no-console */
    return {
      ok: resp.ok && json.every((e) => e.status === 'ok'),
      status: resp.status,
      json,
      path,
    };
  }

  function showErrorModal(sk, resp) {
    sk.showModal([
      `Failed to purge ${resp.path} from the cache. Please reload this page and try again later.`,
      `Status: ${resp.status}`,
      JSON.stringify(resp.json),
    ], true, 0);
    return false;
  }

  sk.add({
    id: 'publish',
    condition: (sidekick) => {
      return sidekick.isHelix() && !sidekick.location.pathname.includes('/drafts/');
    },
    override: true,
    button: {
      action: async () => {
        const { config, location } = sk;
        if (!config.innerHost || !config.host) {
          sk.notify(`Publish is not configured for ${config.project}`, 0);
          return;
        }
        sk.showModal('Publishing...', true);

        let path = location.pathname;

        let resp = await sendPurge(config, path);
        if (resp.ok) {
          // also purge path without /publish segment
          if (path.includes('/publish/')) {
            path = path.replace('/publish/','/');
            console.log(`purging ${path}`)
            resp = await sendPurge(config, path);
            if (!resp.ok) {
              return showErrorModal(sk, resp);
            }
          }
          // fetch and redirect to production
          const prodURL = `https://${config.host}${path}`;
          await fetch(prodURL, {cache: 'reload', mode: 'no-cors'});
          console.log(`redirecting ${prodURL}`);
          window.location.href = prodURL;
        } else {
          return showErrorModal(sk, resp);
        }
      },
    },
  });
})();
