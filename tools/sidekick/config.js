/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// This file contains the blog-specific configuration for the sidekick.
(() => {
  function getArticleData(sk) {
    let date = 0;
    if (window.blog.rawDate) {
      const [month, day, year] = window.blog.rawDate.split('-');
      date = Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 15); // pacific time AM
    }
    let hero = '';
    const metaImg = document.head.querySelector('meta[property="og:image"]');
    if (metaImg) {
      hero = new URL(metaImg.getAttribute('content')).pathname;
    }
    return [
      window.blog.author,
      date/1000,
      hero,
      predictUrl(null, sk.location.pathname),
      `["${window.blog.products.join('\", \"')}"]`,
      '0',
      document.querySelector('main>div:nth-of-type(4)').textContent.trim().substring(0, 75),
      document.title,
      `["${window.blog.topics.join('\", \"')}"]`,
    ];
  }

  function getCardData(sk) {
    const d = getArticleData(sk);
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

  async function toggleCardPreview(sk) {
    if (document.getElementById('hlx-sk-card-preview')) {
      document.getElementById('hlx-sk-card-preview').remove();
      document.body.removeEventListener('keydown', cardPreviewEscListener);
    } else {
      const {
        addCard,
        itemTransformer,
      } = await import('/scripts/v2/common.js');
      const $overlay = document.createElement('div');
      $overlay.id = 'hlx-sk-card-preview';
      $overlay.addEventListener('click', () => {
        toggleCardPreview(sk);
      });
      document.body.prepend($overlay);

      const $modal = document.createElement('div');
      $modal.innerHTML = `
      <style>
        #hlx-sk-card-preview {
          z-index: 9999998;
          position: fixed;
          width: 100vw;
          height: 100vh;
          top: 0;
          left: 0;
          background-color: rgba(0,0,0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #hlx-sk-card-preview .card {
          width: 376px;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 10px 20px 0 rgba(0, 0, 0, 0.3);
        }
      </style>`;
      addCard(await itemTransformer(getCardData(sk)), $modal);
      $overlay.append($modal);
      document.body.addEventListener('keydown', cardPreviewEscListener);
    }
    sk.get('card-preview').firstElementChild.classList.toggle('pressed');
  }

  function cardPreviewEscListener(keyEvt) {
    if (keyEvt.key === 'Escape') {
      toggleCardPreview(sk);
    }
  };

  function allowedPostPath(path) {
    return ![
      'documentation',
      'fpost',
    ].includes(path.split('/')[2]);
  }

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

  const sk = window.hlx.initSidekick({
    project: 'Adobe Blog',
    host: 'blog.adobe.com',
    plugins: [
      // TAGGER -----------------------------------------------------------------------
      {
        id: 'tagger',
        condition: (sk) => sk.isEditor() && (sk.location.search.includes('.docx&') || sk.location.search.includes('.md&')),
        button: {
          text: 'Tagger',
          action: (_, sk) => {
            const { config } = sk;
            window.open(`https://${config.host}/tools/tagger/`, 'hlx-sidekick-tagger');
          },
        },
      },
      // CARD PREVIEW -------------------------------------------------------------------
      {
        id: 'card-preview',
        condition: (sidekick) => {
          return sidekick.isHelix()
            && window.blog && window.blog.pageType === window.blog.TYPE.POST
            && allowedPostPath(sidekick.location.pathname);
        },
        button: {
          text: 'Card Preview',
          action: () => toggleCardPreview(sk),
        },
      },
      // PREDICTED URL ----------------------------------------------------------------
      {
        id: 'predicted-url',
        condition: (sidekick) => {
          const { config, location } = sidekick;
          return sidekick.isHelix()
            && window.blog && window.blog.pageType === window.blog.TYPE.POST
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
      },
      // ARTICLE DATA -------------------------------------------------------------------
      {
        id: 'article-data',
        condition: (sidekick) => {
          return sidekick.isHelix()
            && window.blog && window.blog.pageType === window.blog.TYPE.POST;
        },
        button: {
          text: 'Copy Article Data',
          action: async (_, sk) => {
            try {
              navigator.clipboard.writeText(getArticleData(sk).join('\t'));
              sk.notify('Article data copied to clipboard');
            } catch (e) {
              sk.notify([
                'Unable to copy article data:',
                e,
              ], 0);
            }
          },
        },
      },
      // PUBLISH ----------------------------------------------------------------------
      {
        id: 'publish',
        condition: (sidekick) => {
          // do not show publish button for drafts
          return sidekick.isHelix() && !sidekick.location.pathname.includes('/drafts/');
        },
      },
    ],
  });

  const path = sk.location.pathname;
  if (!path.includes('/publish/') && /\d{4}\/\d{2}\/\d{2}/.test(path)) {
    // post URL without publish in the path, add it back
    const segs = path.split('/');
    segs.splice(2, 0, 'publish')
    sk.location = new URL(segs.join('/'), sk.location.origin);
  }

  sk.addEventListener('statusfetched', () => {
    const webPath = sk.status.webPath;
    if (!webPath) {
      return;
    }
    const file = webPath.split('/').pop();
    if (file && !file.includes('.')) {
      // add .html extension back
      sk.status.webPath = `${webPath}.html`;
    } else if (webPath.endsWith('taxonomy.json')) {
      // add leading underscore back
      sk.status.webPath = webPath.replace('taxonomy.json', '_taxonomy.json');
    }
  });
})();
