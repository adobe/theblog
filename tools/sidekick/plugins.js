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
  const sk = window.hlx && window.hlx.sidekick ? window.hlx.sidekick : window.hlxSidekick;
  if (typeof sk !== 'object') return;

  // sk.loadCSS();

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

  function allowedPostPath(path) {
    return ![
      'documentation',
      'fpost',
    ].includes(path.split('/')[2]);
  }
  
  sk.add({
    id: 'card-preview',
    condition: (sidekick) => {
      return sidekick.isHelix()
        && window.blog.pageType === window.blog.TYPE.POST
        && allowedPostPath(sidekick.location.pathname);
    },
    button: {
      text: 'Card Preview',
      action: async (evt) => {
        const {
          addCard,
          itemTransformer,
        } = await import('/scripts/common.js');
        const sk = window.hlx && window.hlx.sidekick ? window.hlx.sidekick : window.hlxSidekick;
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

  // PREDICTED URL ----------------------------------------------------------------

  function predictUrl(host, path) {
    const pathsplits = path.split('/');
    let publishPath = '';
    if (window.blog && window.blog.rawDate) {
      const datesplits = window.blog.rawDate.split('-');
      if (datesplits.length > 2) {
        publishPath = `/publish/${datesplits[2]}/${datesplits[0]}/${datesplits[1]}`;
      }
    }
    const filename = (pathsplits[pathsplits.length-1].split('.')[0]).toLowerCase().replace(/[^a-z\d_\/\.]/g,'-');
    return `${host ? `https://${host}/` : ''}${pathsplits[1]}${publishPath}/${filename}.html`;
  }
  
  sk.add({
    id: 'predicted-url',
    condition: (sidekick) => {
      const { config, location } = sidekick;
      return sidekick.isHelix()
        && window.blog.pageType === window.blog.TYPE.POST
        && config.host
        && location.host != config.host
        && allowedPostPath(location.pathname);
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

  sk.add({
    id: 'publish',
    condition: (sidekick) => {
      // do not show publish button for drafts
      return sidekick.isHelix() && !sidekick.location.pathname.includes('/drafts/');
    },
  });

  // PUBLISH TAXONOMY -------------------------------------------------------------

  sk.add({
    id: 'publish-taxonomy',
    condition: (sk) => {
      const { config, location } = sk;
      return config.innerHost
        && config.host
        && sk.isEditor()
        && location.search.includes('file=_taxonomy.xlsx');
    },
    override: true,
    button: {
      text: 'Publish',
      action: async () => {
        const { config } = sk;
        sk.showModal('Publishing taxonomy...', true);
        const url = new URL('https://adobeioruntime.net/api/v1/web/helix/helix-services/content-proxy@v2');
        url.search = new URLSearchParams([
          ['report', 'true'],
          ['owner', config.owner],
          ['repo', config.repo],
          ['ref', config.ref || 'main'],
          ['path', '/'],
          ['lookup', location.href],
        ]).toString();
        const resp = await fetch(url.toString());
        const json = await resp.json();
        if (!resp.ok || !json.unfriendlyWebUrl) {
          sk.notify('Failed to publish taxonomy. Please try again later.', 0);
          console.log('error', JSON.stringify(await resp.json()));
        }
        const path = new URL(json.unfriendlyWebUrl).pathname;
        const purge = await sendPurge(config, path);
        if (purge.ok) {
          await fetch(json.unfriendlyWebUrl, {cache: 'reload', mode: 'no-cors'});
          sk.notify('Taxonomy published');
        } else {
          sk.notify('Failed to publish taxonomy. Please try again later.', 0);
          console.log('error', JSON.stringify(purge));
        }
      },
    },
  });
})();
