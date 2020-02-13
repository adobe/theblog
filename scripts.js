  /*
   * scrani.js
   */

  (() => {
    const scrani = (() => {

        const scrani = {

            // config
            animations: [
                {selector: "body>main>div", animation:"eager-appear"},
                {selector: "body>main>div>p>img", animation:"wipe"}
            ],

            scrollY: -1,
            scrollYBottom:  0,
        }

        // setup
        scrani.setup = () => {
            for (let i=0; i<scrani.animations.length; i++) {
                const a = scrani.animations[i];
                a.elems=document.querySelectorAll(a.selector);
            }
        }

        // update single element
        scrani.updateElement = (el, animation) => {
            let progress=0.0;
            const offsetTop = el.getBoundingClientRect().top+window.pageYOffset;

            if (scrani.scrollY > offsetTop) {
                progress=1.0;
            } else if (scrani.scrollYBottom < offsetTop) {
                progress=0.0;
            } else {
                progress=1.0-(offsetTop - scrani.scrollY)/window.innerHeight;
            }

            // HACK: manually specified animation
            progress=progress*2;
            if (progress>1) progress=1;
            
            // lazyload images
            if (progress > 0) {
              setTimeout(() => {
                el.querySelectorAll('img.lazyload').forEach(img => lazyload(img));
              }, 1000);
            }

            if (animation == "eager-appear") {
                const transY=100-progress*100;
                const opacity=progress;
                el.style=`opacity: ${opacity}; transform: translateY(${transY}px)`;
            }

            if (animation == "wipe") {
                const right=Math.round(100-progress*100);
                el.style=`clip-path: inset(0 ${right}% 0 0); -webkit-clip-path: inset(0 ${right}% 0 0)`;
            }
        }

        // update to get called by requestAnimationFrame
        scrani.update = (scrollY) => {

            if (scrollY == scrani.scrollY) return;

            scrani.scrollY = scrollY;
            scrani.scrollYBottom = scrollY+window.innerHeight;

            for (let i=0; i<scrani.animations.length;i++) {
                const a = scrani.animations[i];
                for (let j=0; j<a.elems.length;j++) {
                    scrani.updateElement(a.elems[j], a.animation);
                }
            }
        }

        //to be called onload
        scrani.onload = () => {

            scrani.setup();
            const repaint = () => {
                scrani.update(window.scrollY)
                window.requestAnimationFrame(repaint)
            }
            window.requestAnimationFrame(repaint);

        }

        return (scrani)
    })();

    window.scrani = scrani;

})();

  /*
   * all pages
   */

  // load language specific css overlays

  const loadCssFile = (path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  };

  if (language !== LANG.EN) { // skip for en
    loadCssFile(`/dict.${language}.css`);
  }

  const isHome = pageType == TYPE.HOME;
  const isPost = pageType === TYPE.POST;
  const isAuthor = pageType === TYPE.AUTHOR;
  const isTopic = pageType === TYPE.TOPIC;
  const isProduct = pageType === TYPE.PRODUCT;

  const itemTransformer = (item) => ({
    ...item,
    hero: `${item.hero}?width=256&auto=webp`,
    date: new Date(item.date * 1000).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    authorUrl: getLink(TYPE.AUTHOR, item.author),
    topic: item.topics.length > 0 ? item.topics[0] : '',
    topicUrl: item.topics.length > 0 ? getLink(TYPE.TOPIC, item.topics[0]) : '',
  });

  function addPageTypeAsBodyClass() {
    document.body.classList.add(`${pageType}-page`);
  }

  function createSVG(id) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink','href',`/icons.svg#${id}`);
    svg.appendChild(use);
    return svg;
  }

  function removeHeaderAndFooter () {
    // workaound until the ESI is fixed
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    if (header.innerHTML == "/header.plain.html") header.innerHTML = "";
    if (footer.innerHTML == "/footer.plain.html") footer.innerHTML = "";
  }

  function getSection(index) {
    const nodes = document.querySelectorAll("main > div");
    return index && nodes.length > index ? nodes[index] : nodes[nodes.length - 1];
  }

  function getLink(type, name) {
    if (!type.endsWith('s')) type += 's';
    return `${context}${language}/${type}/${name.replace(/\s/gm, '-').replace(/\&amp;/gm,'').replace(/\&/gm,'').toLowerCase()}.html`;
  }

  function checkConsent() {
    if (window.feds && window.feds.privacy && !window.feds.privacy.hasUserProvidedConsent) {
      window.feds.privacy.showConsentPopup();
    }
  }

  function fillData(elem, data) {
    const TOKEN_REGEXP = /{{(.+)}}/;
    for (let i = 0; i < elem.attributes.length; i++) {
      const attr = elem.attributes[i];
      const match = TOKEN_REGEXP.exec(attr.value);
      if (match) {
        attr.value = attr.value.replace(TOKEN_REGEXP, data[match[1]] || '');
      }
    }
    let node = elem.firstChild;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const match = TOKEN_REGEXP.exec(node.textContent);
        if (match) {
          node.textContent = node.textContent.replace(TOKEN_REGEXP, data[match[1]] || '');
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        fillData(node, data);
      }
      node = node.nextSibling;
    }
    return elem;
  }

  function setupSearch({
    indexName = 'davidnuescheler--theblog--blog-posts',
    hitsPerPage = 12,
    facetFilters = [],
    container = '.posts',
    itemTemplate = document.getElementById('post-card'),
    emptyTemplate = 'There are no articles yet',
    transformer = itemTransformer,
  }) {
    const searchClient = algoliasearch('A8PL9E4TZT', '9e59db3654d13f71d79c4fbb4a23cc72');
    const index = searchClient.initIndex(indexName);
    const filters = Array.from(facetFilters);
    filters.push(`parents:${context}${language}`);
    index.search('*', {
      filters: filters.join(' AND '),
      numericFilters: `date < ${Date.now()/1000}`, // hide articles with future dates
      hitsPerPage,
    }).then(({hits}) => {
      const $hits = document.createElement('div');
      $hits.classList.add('ais-Hits');
      if (hits.length === 0) {
        const $empty = document.createElement('div');
        $empty.textContent = emptyTemplate;
        $hits.appendChild($empty);
      } else {
        const $list = document.createElement('ol');
        $list.classList.add('ais-Hits-list');
        $hits.appendChild($list);
        hits
          .map(transformer)
          .forEach((hit) => {
            const $item = itemTemplate.content.cloneNode(true).firstElementChild;
            fillData($item, hit);
            const $hit = document.createElement('li');
            $hit.classList.add('ais-Hits-item');
            $hit.appendChild($item);
            $list.appendChild($hit);
          });
      }
      const $el = document.querySelector(container);
      $el.appendChild($hits);
    });
  }

  /*
   * homepage
   */

  function setupHomepage() {
    if (!document.title) {
      document.title = 'The Blog | Welcome to the Adobe Blog';
    }
    document.querySelectorAll('main div')[0].remove();

    const postsWrap = document.createElement('div');
    postsWrap.className = 'default latest-posts';
    getSection().parentNode.appendChild(postsWrap);
    setupSearch({
      hitsPerPage: 13,
      container: '.latest-posts',
      itemTemplate: document.getElementById('homepage-card'),
      transformer: (item, index) => {
        item = itemTransformer(item);
        if (index === 0) {
          // use larger hero image on first article and skip lazyloading
          item.hero = item.hero.replace('?width=256', `?width=${window.innerWidth <= 900 ? 900 : 2048}`);
        }
        return item;
      },
    });
  }

  /*
   * post page
   */

  function fetchAuthor() {
    const insertInside = getSection(2);
    if (insertInside) {
      insertInside.classList.add('left');
      const r = /^By (.*)\n*(.*)$/gmi.exec(insertInside.innerText);
      const author = r && r.length > 0 ? r[1] : null;
      const date = r && r.length > 1 ? r[2] : ''
      if (author) {
        // clear the content of the div and replace by avatar and text
        insertInside.innerHTML = '';
        const xhr = new XMLHttpRequest();
        const fileName = author.replace(/\s/gm, '-').toLowerCase();
        const pageURL = getLink(TYPE.AUTHOR, author);
        xhr.open('GET', pageURL);
        xhr.onload = function() {
          if (xhr.status != 200 || xhr.status != 304) {
            // try to get <main> elements and find author image
            const groups = /(^\s*<main>)((.|\n)*?)<\/main>/gm.exec(xhr.responseText);
            if (!groups) return;
            let main = groups.length > 2 ? groups[2] : null;
            if (main) {
              main = main.replace(fileName, '../authors/' + fileName);

              const avatarURL = /<img src="(.*?)">/.exec(main)[1];
              const authorDiv = document.createElement('div');
              authorDiv.innerHTML = '<img alt="' + author + '" src="' + `${avatarURL}?width=120&auto=webp` + '"> \
                <span class="post-author">by <a href="' + pageURL + '">' + author + '</a></span> \
                <span class="post-date">' + date + '</span> \
                ';
              authorDiv.classList.add('author');
              // try to get the author's social links
              const socialLinks = /<p>(Social\: .*)<\/p>/gi.exec(xhr.responseText);
              if (socialLinks) {
                const p = document.createElement('p');
                p.innerHTML = socialLinks[1];
                fetchSocialLinks(p, authorDiv);
              }
              insertInside.prepend(authorDiv);
            }
          } else {
            console.log('Author not found...', xhr.response);
          }
        };
        xhr.send();
      }
    }
  }

  function fetchTopics() {
    const last = getSection();
    if (last) {
      let hits = [];
      let topics, container;
      Array.from(last.children).forEach((i) => {
        const r = /^Topics\: ?(.*)$/gmi.exec(i.innerText);
        if (r && r.length > 0) {
          hits = r[1].split(',');
          container = i;
        }
      });
      topics = hits.filter((hit) => {
        return hit.trim().length > 0;
      });
      if (container) {
        container.remove();
      }
      if (topics.length > 0) {
        const topicsWrap = document.createElement('div');
        topicsWrap.className = 'default topics';
        topics.forEach((topic) => {
          topic = topic.trim();
          if (!topic) return;
          const btn = document.createElement('a');
          btn.href = getLink(TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase());
          btn.title = topic;
          btn.innerText = topic;

          topicsWrap.appendChild(btn);
        });
        // topicsWrap.appendChild(btnWrap);
        last.parentNode.insertBefore(topicsWrap, last);
      }
    }
  }

  function fetchProducts() {
    const last = getSection();
    const insertInside = getSection(2);
    if (insertInside) {
      insertInside.classList.add('left');
      let hits = [];
      let products, container;
      Array.from(last.children).forEach((i) => {
        const r = /^Products\: ?(.*)$/gmi.exec(i.innerText);
        if (r && r.length > 0) {
          hits = r[1].split(',');
          container = i;
        }
      });
      products = hits.filter((hit) => {
        return hit.trim().length > 0;
      });
      if (container) {
        container.remove();
      }
      if (products.length > 0) {
        const productsWrap = document.createElement('div');
        productsWrap.className = 'products';
        products.forEach((product) => {
          product = product.trim();
          if (!product) return;
          const productRef = product.replace(/\s/gm, '-').toLowerCase();

          const btn = document.createElement('a');
          btn.href = `https://www.adobe.com/${productRef}.html`;
          btn.title = product;

          const img = document.createElement('img');
          img.src = `/icons/${productRef}.svg`;
          img.alt = product;

          btn.appendChild(img);

          productsWrap.appendChild(btn);
        });
        insertInside.appendChild(productsWrap);
      }
    }
  }

  function removeEmptySection() {
    const last=getSection();
    if (last.innerHTML.trim() === "") {
      last.remove();
    }
  }

  /*
   * author page
   */

  const socialLinkTitles = [
    'Twitter',
    'LinkedIn',
    'Facebook',
    'YouTube',
  ];

  function getSocialLinkDetails(url) {
    let title;
    socialLinkTitles.forEach((t) => {
      if (!title && url.indexOf(t.toLowerCase()) > 0) {
        title = t;
      }
    });
    if (!title) title = 'Unknown';
    const type = title.toLowerCase();
    return {
      title,
      type,
      className: `social-${type}`,
    };
  }

  function fetchSocialLinks(source, target) {
    if (!source) {
      source = getSection(); // get the last section of the current document
    }
    if (!target) {
      target = source.parentNode;
    }
    if (source) {
      const r = /^Social\: (.*)$/gmi.exec(source.innerText);
      const links = r && r.length > 0 ? r[1].split(',') : null;
      if (links) {
        source.innerHTML = source.innerHTML.replace(/<p>Social\: .*<\/p>/gi, '');
        const socialWrap = document.createElement('div');
        socialWrap.className = 'default social';
        links.forEach((url) => {
          url = url.trim();
          if (!url) return;
          const { title, type, className } = getSocialLinkDetails(url);
          const link = document.createElement('a');
          link.className = className;
          link.title = title;
          link.href = url;
          link.appendChild(createSVG(type));
          socialWrap.appendChild(link);
        });
        target.insertBefore(socialWrap, source.nextSibling);
      }
    }
  }

  function fetchLatestPosts(type) {
    let filter, emptyTemplate;
    if (type === TYPE.TOPIC) {
      filter = `topics:${document.title}`;
      emptyTemplate = 'There are no articles in this topic yet';
    } else {
      filter = `author:${document.title.split(',')[0]}`;
      emptyTemplate = 'This author has not posted any articles yet.';
    }
    const latestWrap = document.createElement('div');
    latestWrap.className = 'default latest-posts';
    getSection().parentNode.appendChild(latestWrap);
    setupSearch({
      facetFilters: [
          filter,
        ],
      container: '.latest-posts',
      emptyTemplate,
    });
  }

  window.onload = function() {
    removeHeaderAndFooter();
    addPageTypeAsBodyClass();
    checkConsent();
    scrani.onload();
    if (isHome) {
      setupHomepage();
    } else if (isPost) {
      fetchAuthor();
      fetchTopics();
      fetchProducts();
      removeEmptySection();
    } else if (isAuthor) {
      fetchSocialLinks();
      fetchLatestPosts(TYPE.AUTHOR);
    } else if (isTopic) {
      fetchLatestPosts(TYPE.TOPIC);
    } else if (isProduct) {
      // todo
    }
  };

  (function regionPicker () {
    let regionPickerLoaded = false;
    let modal;

    const insertRegionPickerHtml = (html) => {
      const mainEl = document.querySelector('main');
      mainEl.insertAdjacentHTML('afterend', html);
      const langNavModal = document.querySelector('#languageNavigation')
      const modalContainer = langNavModal.closest('.modalContainer');
      modalContainer.classList.remove('hide-all');
      return langNavModal;
    };

    const loadRegionPicker = async () => {
      if (regionPickerLoaded) {
        modal.open();
        return;
      };

      const regionPickerHtml = fetch(
        '/partials/regionPicker/regionPicker.html',
        { credentials: 'same-origin' },
      );

      const modalJs = import('/partials/modal/modal.js');

      const [response, ModalModule] = await Promise.all([regionPickerHtml, modalJs]);
      if (!response.ok) return;

      const html = await response.text();
      const langNavModal = insertRegionPickerHtml(html);
      modal = new ModalModule.Modal(langNavModal);

      loadCssFile('/partials/regionPicker/regionPicker.css');

      if (language !== LANG.EN) {
          loadCssFile(`/partials/regionPicker/dict.${language}.css`);
      }

      regionPickerLoaded = true;
    };

    const checkHash = () => {
      if (window.location.hash === '#languageNavigation') {
        loadRegionPicker();
      }
    };
    checkHash();

    window.addEventListener('hashchange', () => {
      checkHash();
    });
  })();
