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
                a = scrani.animations[i];
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
   * navigation
   */

function addNavToggleListener() {
    const t=document.querySelector('#menuToggle input');
    if (t) {
        t.addEventListener('change', function() {
            if(this.checked) {
                document.querySelector("header div:nth-of-type(2)").classList.add('on');
            } else {
                document.querySelector("header div:nth-of-type(2)").classList.remove('on');
            }
        });
    const n=document.querySelector("header div:nth-of-type(2)");
    if (n) {
        n.addEventListener("click",function(e) {
            if (e.target && e.target.matches("li")) {
                const ul=e.target.querySelector("ul");
                if (ul) {
                    if (!ul.classList.contains("expanded")) {
                        n.querySelectorAll("ul.expanded").forEach((e) => {
                            e.classList.remove("expanded");
                        })
                        ul.classList.add("expanded");
                        const pul=ul.parentNode.parentNode;
                        if (pul.matches("ul")) {
                            pul.classList.add("expanded");
                        }

                    } else {
                        ul.classList.remove("expanded");
                    }
                }
              }
            e.stopPropagation();
          });
        }
      }
  }

  function wireNav() {
    document.querySelectorAll("header div:nth-of-type(2) li").forEach((e) => {
      if (!e.querySelector("a") && !e.querySelector("ul")) {
        var topli=e;
        while (topli.parentElement.parentElement.matches("li")) {
          topli=topli.parentElement.parentElement;
        }
        var cat=topli.innerText.toLowerCase();
        var tag=e.innerHTML.replace(/\s/gm, '-').toLowerCase();
        e.innerHTML=`<a href="/${cat}/${tag}">${e.innerText}</a>`;
      }
    });
  }


  /*
   * all pages
   */

  const TYPE = {
    HOME: 'home',
    POST: 'post',
    AUTHOR: 'author',
    TOPIC: 'topic',
    PRODUCT: 'product',
  }

  function getPageType() {
    const type = /^\/(ms|g)\/(archive\/)?([a-z]*)s\//.exec(window.location.pathname);
    if (type && type.length === 4) {
      for (let [key, value] of Object.entries(TYPE)) {
        if (type[3].indexOf(value) !== -1) {
          return value;
        }
      }
    }
    return TYPE.HOME; // fall back to homepage
  }

  function getContext() {
    const ctx = /^\/(ms|g)?/.exec(window.location.pathname);
    if (ctx && ctx.length === 2) {
      return `/${ctx[1]}/`;
    }
    return '/';
  }

  const pageType = getPageType();
  const context = getContext();
  const isHome = pageType == TYPE.HOME;
  const isPost = pageType === TYPE.POST;
  const isAuthor = pageType === TYPE.AUTHOR;
  const isTopic = pageType === TYPE.TOPIC;
  const isProduct = pageType === TYPE.PRODUCT;

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
    return `${context}${type}s/${name.replace(/\s/gm, '-').toLowerCase()}.html`;
  }

  function setupSearch({
    indexName = 'davidnuescheler--theblog--blog-posts',
    hitsPerPage = 9,
    facetFilters = [],
    container = '.posts',
    itemTemplate = `
    <div class="post">
      <div class="hero"><a href="/{{path}}" title="{{{title}}}"><img src="{{hero}}" alt="{{{title}}}"></a></div>
      <div class="content">
        <span class="author">
          <a href="{{authorUrl}}" title="{{{author}}}">{{{author}}}</a>
        </span>
        <h2><a href="/{{path}}" title="{{{title}}}">{{{title}}}</a></h2>
        <span class="teaser">
          <a href="/{{path}}" title="{{{teaser}}}…">{{{teaser}}}…</a>
        </span>
        <span class="date">{{{date}}}</span>
      </div>
    </a>
    </div>
    `,
    emptyTemplate = 'There are no articles yet',
    transformer = (item) => ({
      ...item,
      date: new Date(item.date * 1000).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      authorUrl: getLink(TYPE.AUTHOR, item.author),
    }),
  }) {
    // const searchClient = algoliasearch('LPQI0MG7ST', '9bf61456f606d21ddc1723f30500659e');
    const searchClient = algoliasearch('A8PL9E4TZT', '9e59db3654d13f71d79c4fbb4a23cc72');
    const search = instantsearch({
      indexName,
      searchClient,
      routing: true,
    });
    search.addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage,
        facetFilters,
      }),
    ]);
    search.addWidgets([
      instantsearch.widgets.hits({
        container,
        templates: {
          item: itemTemplate,
          empty: emptyTemplate,
        },
        transformItems(items) {
          return items.map(item => transformer(item));
        },
      }),
    ]);
    return search;
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
      itemTemplate: `
      <div class="post">
        <div class="hero"><a href="/{{path}}" title="{{{title}}}"><img src="{{hero}}" alt="{{{title}}}"></a></div>
        <div class="content">
          <span class="date">{{{date}}}</span>
          <h2><a href="/{{path}}" title="{{{title}}}">{{{title}}}</a></h2>
          <span class="teaser">
            <a href="/{{path}}" title="{{{teaser}}}…">{{{teaser}}}…</a>
          </span>
          <span class="author">
            <a href="{{authorUrl}}" title="{{{author}}}">{{{author}}}</a>
          </span>
      </div>
    </a>
    </div>
    `,
    }).start();
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
            let main = groups.length > 2 ? groups[2] : null;
            if (main) {
              main = main.replace(fileName, '../authors/' + fileName);

              const avatarURL = /<img src="(.*?)">/.exec(main)[1];
              const authorDiv = document.createElement('div');
              authorDiv.innerHTML = '<img src="' + avatarURL + '"> \
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
      let topics, container;
      Array.from(last.children).forEach((i) => {
        const r = /^Topics\: (.*)$/gmi.exec(i.innerText);
        if (r && r.length > 0) {
          topics = r[1].split(',');
          container = i;
        }
      });
      if (container) {
        container.remove();
      }
      if (topics) {
        const topicsWrap = document.createElement('div');
        topicsWrap.className = 'default topics';
        topics.forEach((topic) => {
          topic = topic.trim();
          if (!topic) return;
          const btn = document.createElement('a');
          btn.href = getLink(TYPE.TOPIC, topic);
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
      let products, container;
      Array.from(last.children).forEach((i) => {
        const r = /^Products\: (.*)$/gmi.exec(i.innerText);
        if (r && r.length > 0) {
          products = r[1].split(',');
          container = i;
        }
      });
      if (container) {
        container.remove();
      }
      if (products) {
        const productsWrap = document.createElement('div');
        productsWrap.className = 'products';
        products.forEach((product) => {
          const productRef = product.trim().replace(/\s/gm, '-').toLowerCase();

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

  function fetchLatestPosts() {
    const latestWrap = document.createElement('div');
    latestWrap.className = 'default latest-posts';
    getSection().parentNode.appendChild(latestWrap);
    setupSearch({
      facetFilters: [
          `author:${document.title}`,
        ],
      container: '.latest-posts',
      emptyTemplate: 'This author has not posted any articles yet.',
    }).start();
  }

  window.onload = function() {
    removeHeaderAndFooter();
    addPageTypeAsBodyClass();
    this.addNavToggleListener();
    this.wireNav();
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
      fetchLatestPosts();
    } else if (isTopic) {
      // todo
    } else if (isProduct) {
      // todo
    }
  }

  window.onhashchange = function() {
    if (window.location.hash === "#menu") {
      document.querySelector("header div:nth-child(2)").style="display:block";
    } else {
      document.querySelector("header div:nth-child(2)").style="";
    }
  }

