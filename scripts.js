  /*
   * lazysizes - v5.2.0 
   * The MIT License (MIT)
   * Copyright (c) 2015 Alexander Farkas
   */
  !function(a,b){var c=b(a,a.document,Date);a.lazySizes=c,"object"==typeof module&&module.exports&&(module.exports=c)}("undefined"!=typeof window?window:{},function(a,b,c){"use strict";var d,e;if(function(){var b,c={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:!0,expFactor:1.5,hFac:.8,loadMode:2,loadHidden:!0,ricTimeout:0,throttleDelay:125};e=a.lazySizesConfig||a.lazysizesConfig||{};for(b in c)b in e||(e[b]=c[b])}(),!b||!b.getElementsByClassName)return{init:function(){},cfg:e,noSupport:!0};var f=b.documentElement,g=a.HTMLPictureElement,h="addEventListener",i="getAttribute",j=a[h].bind(a),k=a.setTimeout,l=a.requestAnimationFrame||k,m=a.requestIdleCallback,n=/^picture$/i,o=["load","error","lazyincluded","_lazyloaded"],p={},q=Array.prototype.forEach,r=function(a,b){return p[b]||(p[b]=new RegExp("(\\s|^)"+b+"(\\s|$)")),p[b].test(a[i]("class")||"")&&p[b]},s=function(a,b){r(a,b)||a.setAttribute("class",(a[i]("class")||"").trim()+" "+b)},t=function(a,b){var c;(c=r(a,b))&&a.setAttribute("class",(a[i]("class")||"").replace(c," "))},u=function(a,b,c){var d=c?h:"removeEventListener";c&&u(a,b),o.forEach(function(c){a[d](c,b)})},v=function(a,c,e,f,g){var h=b.createEvent("Event");return e||(e={}),e.instance=d,h.initEvent(c,!f,!g),h.detail=e,a.dispatchEvent(h),h},w=function(b,c){var d;!g&&(d=a.picturefill||e.pf)?(c&&c.src&&!b[i]("srcset")&&b.setAttribute("srcset",c.src),d({reevaluate:!0,elements:[b]})):c&&c.src&&(b.src=c.src)},x=function(a,b){return(getComputedStyle(a,null)||{})[b]},y=function(a,b,c){for(c=c||a.offsetWidth;c<e.minSize&&b&&!a._lazysizesWidth;)c=b.offsetWidth,b=b.parentNode;return c},z=function(){var a,c,d=[],e=[],f=d,g=function(){var b=f;for(f=d.length?e:d,a=!0,c=!1;b.length;)b.shift()();a=!1},h=function(d,e){a&&!e?d.apply(this,arguments):(f.push(d),c||(c=!0,(b.hidden?k:l)(g)))};return h._lsFlush=g,h}(),A=function(a,b){return b?function(){z(a)}:function(){var b=this,c=arguments;z(function(){a.apply(b,c)})}},B=function(a){var b,d=0,f=e.throttleDelay,g=e.ricTimeout,h=function(){b=!1,d=c.now(),a()},i=m&&g>49?function(){m(h,{timeout:g}),g!==e.ricTimeout&&(g=e.ricTimeout)}:A(function(){k(h)},!0);return function(a){var e;(a=!0===a)&&(g=33),b||(b=!0,e=f-(c.now()-d),e<0&&(e=0),a||e<9?i():k(i,e))}},C=function(a){var b,d,e=99,f=function(){b=null,a()},g=function(){var a=c.now()-d;a<e?k(g,e-a):(m||f)(f)};return function(){d=c.now(),b||(b=k(g,e))}},D=function(){var g,m,o,p,y,D,F,G,H,I,J,K,L=/^img$/i,M=/^iframe$/i,N="onscroll"in a&&!/(gle|ing)bot/.test(navigator.userAgent),O=0,P=0,Q=0,R=-1,S=function(a){Q--,(!a||Q<0||!a.target)&&(Q=0)},T=function(a){return null==K&&(K="hidden"==x(b.body,"visibility")),K||!("hidden"==x(a.parentNode,"visibility")&&"hidden"==x(a,"visibility"))},U=function(a,c){var d,e=a,g=T(a);for(G-=c,J+=c,H-=c,I+=c;g&&(e=e.offsetParent)&&e!=b.body&&e!=f;)(g=(x(e,"opacity")||1)>0)&&"visible"!=x(e,"overflow")&&(d=e.getBoundingClientRect(),g=I>d.left&&H<d.right&&J>d.top-1&&G<d.bottom+1);return g},V=function(){var a,c,h,j,k,l,n,o,q,r,s,t,u=d.elements;if((p=e.loadMode)&&Q<8&&(a=u.length)){for(c=0,R++;c<a;c++)if(u[c]&&!u[c]._lazyRace)if(!N||d.prematureUnveil&&d.prematureUnveil(u[c]))ba(u[c]);else if((o=u[c][i]("data-expand"))&&(l=1*o)||(l=P),r||(r=!e.expand||e.expand<1?f.clientHeight>500&&f.clientWidth>500?500:370:e.expand,d._defEx=r,s=r*e.expFactor,t=e.hFac,K=null,P<s&&Q<1&&R>2&&p>2&&!b.hidden?(P=s,R=0):P=p>1&&R>1&&Q<6?r:O),q!==l&&(D=innerWidth+l*t,F=innerHeight+l,n=-1*l,q=l),h=u[c].getBoundingClientRect(),(J=h.bottom)>=n&&(G=h.top)<=F&&(I=h.right)>=n*t&&(H=h.left)<=D&&(J||I||H||G)&&(e.loadHidden||T(u[c]))&&(m&&Q<3&&!o&&(p<3||R<4)||U(u[c],l))){if(ba(u[c]),k=!0,Q>9)break}else!k&&m&&!j&&Q<4&&R<4&&p>2&&(g[0]||e.preloadAfterLoad)&&(g[0]||!o&&(J||I||H||G||"auto"!=u[c][i](e.sizesAttr)))&&(j=g[0]||u[c]);j&&!k&&ba(j)}},W=B(V),X=function(a){var b=a.target;if(b._lazyCache)return void delete b._lazyCache;S(a),s(b,e.loadedClass),t(b,e.loadingClass),u(b,Z),v(b,"lazyloaded")},Y=A(X),Z=function(a){Y({target:a.target})},$=function(a,b){try{a.contentWindow.location.replace(b)}catch(c){a.src=b}},_=function(a){var b,c=a[i](e.srcsetAttr);(b=e.customMedia[a[i]("data-media")||a[i]("media")])&&a.setAttribute("media",b),c&&a.setAttribute("srcset",c)},aa=A(function(a,b,c,d,f){var g,h,j,l,m,p;(m=v(a,"lazybeforeunveil",b)).defaultPrevented||(d&&(c?s(a,e.autosizesClass):a.setAttribute("sizes",d)),h=a[i](e.srcsetAttr),g=a[i](e.srcAttr),f&&(j=a.parentNode,l=j&&n.test(j.nodeName||"")),p=b.firesLoad||"src"in a&&(h||g||l),m={target:a},s(a,e.loadingClass),p&&(clearTimeout(o),o=k(S,2500),u(a,Z,!0)),l&&q.call(j.getElementsByTagName("source"),_),h?a.setAttribute("srcset",h):g&&!l&&(M.test(a.nodeName)?$(a,g):a.src=g),f&&(h||l)&&w(a,{src:g})),a._lazyRace&&delete a._lazyRace,t(a,e.lazyClass),z(function(){var b=a.complete&&a.naturalWidth>1;p&&!b||(b&&s(a,"ls-is-cached"),X(m),a._lazyCache=!0,k(function(){"_lazyCache"in a&&delete a._lazyCache},9)),"lazy"==a.loading&&Q--},!0)}),ba=function(a){if(!a._lazyRace){var b,c=L.test(a.nodeName),d=c&&(a[i](e.sizesAttr)||a[i]("sizes")),f="auto"==d;(!f&&m||!c||!a[i]("src")&&!a.srcset||a.complete||r(a,e.errorClass)||!r(a,e.lazyClass))&&(b=v(a,"lazyunveilread").detail,f&&E.updateElem(a,!0,a.offsetWidth),a._lazyRace=!0,Q++,aa(a,b,f,d,c))}},ca=C(function(){e.loadMode=3,W()}),da=function(){3==e.loadMode&&(e.loadMode=2),ca()},ea=function(){if(!m){if(c.now()-y<999)return void k(ea,999);m=!0,e.loadMode=3,W(),j("scroll",da,!0)}};return{_:function(){y=c.now(),d.elements=b.getElementsByClassName(e.lazyClass),g=b.getElementsByClassName(e.lazyClass+" "+e.preloadClass),j("scroll",W,!0),j("resize",W,!0),j("pageshow",function(a){if(a.persisted){var c=b.querySelectorAll("."+e.loadingClass);c.length&&c.forEach&&l(function(){c.forEach(function(a){a.complete&&ba(a)})})}}),a.MutationObserver?new MutationObserver(W).observe(f,{childList:!0,subtree:!0,attributes:!0}):(f[h]("DOMNodeInserted",W,!0),f[h]("DOMAttrModified",W,!0),setInterval(W,999)),j("hashchange",W,!0),["focus","mouseover","click","load","transitionend","animationend"].forEach(function(a){b[h](a,W,!0)}),/d$|^c/.test(b.readyState)?ea():(j("load",ea),b[h]("DOMContentLoaded",W),k(ea,2e4)),d.elements.length?(V(),z._lsFlush()):W()},checkElems:W,unveil:ba,_aLSL:da}}(),E=function(){var a,c=A(function(a,b,c,d){var e,f,g;if(a._lazysizesWidth=d,d+="px",a.setAttribute("sizes",d),n.test(b.nodeName||""))for(e=b.getElementsByTagName("source"),f=0,g=e.length;f<g;f++)e[f].setAttribute("sizes",d);c.detail.dataAttr||w(a,c.detail)}),d=function(a,b,d){var e,f=a.parentNode;f&&(d=y(a,f,d),e=v(a,"lazybeforesizes",{width:d,dataAttr:!!b}),e.defaultPrevented||(d=e.detail.width)&&d!==a._lazysizesWidth&&c(a,f,e,d))},f=function(){var b,c=a.length;if(c)for(b=0;b<c;b++)d(a[b])},g=C(f);return{_:function(){a=b.getElementsByClassName(e.autosizesClass),j("resize",g)},checkElems:g,updateElem:d}}(),F=function(){!F.i&&b.getElementsByClassName&&(F.i=!0,E._(),D._())};return k(function(){e.init&&F()}),d={cfg:e,autoSizer:E,loader:D,init:F,uP:w,aC:s,rC:t,hC:r,fire:v,gW:y,rAF:z}});

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
   * all pages
   */

  const TYPE = {
    HOME: 'home',
    POST: 'post',
    AUTHOR: 'author',
    TOPIC: 'topic',
    PRODUCT: 'product',
  }

  function getPageInfo() {
    let context = '/ms/';
    let language = 'en';
    let pageType = TYPE.HOME;
    const info = /^\/(ms|g)\/([a-z-_]*)\/([a-z]*)\//gi.exec(window.location.pathname);
    if (info && info.length === 4) {
      context = `/${info[1]}/`;
      language = info[2];
      if (info[3] === 'archive') {
        pageType = TYPE.POST;
      } else {
        for (let [key, value] of Object.entries(TYPE)) {
          if (info[3].startsWith(value)) {
            pageType = value;
            break;
          }
        }
      }
    }
    return { context, language, pageType };
  }

  const {
    context,
    language,
    pageType,
   } = getPageInfo();
  const isHome = pageType == TYPE.HOME;
  const isPost = pageType === TYPE.POST;
  const isAuthor = pageType === TYPE.AUTHOR;
  const isTopic = pageType === TYPE.TOPIC;
  const isProduct = pageType === TYPE.PRODUCT;

  const itemTransformer = (item) => ({
    ...item,
    hero: `${item.hero}?width=256`,
    date: new Date(item.date * 1000).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    dateISO: new Date(item.date * 1000).toISOString(),
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
    return !isNaN(index) && nodes.length > index ? nodes[index] : nodes[nodes.length - 1];
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

  function setupSearch({
    indexName = 'davidnuescheler--theblog--blog-posts',
    hitsPerPage = 12,
    facetFilters = [],
    container = '.posts',
    itemTemplate = `
    <div class="post" itemscope itemtype="http://schema.org/BlogPosting">
      <div class="hero">
        <a href="/{{path}}" title="{{{title}}}"><img class="lazyload" itemprop="image" content="{{hero}}" data-src="{{hero}}" alt="{{{title}}}"></a>
        <a class="topic" itemprop="genre" href="{{topicUrl}}" title="{{{topic}}}">{{{topic}}}</a>
      </div>
      <div class="content">
        <span class="author" itemprop="author" itemscope itemtype="http://schema.org/Person">
          <a itemprop="url" href="{{authorUrl}}" title="{{{author}}}"><span itemprop="name">{{{author}}}</span></a>
        </span>
        <h2 itemprop="headline"><a href="/{{path}}" title="{{{title}}}">{{{title}}}</a></h2>
        <span class="teaser" itemprop="abstract">
          <a itemprop="url" href="/{{path}}" title="{{{teaser}}}…">{{{teaser}}}…</a>
        </span>
        <span class="date" itemprop="datePublished" content="{{{dateISO}}}">{{{date}}}</span>
      </div>
    </div>
    `,
    emptyTemplate = 'There are no articles yet',
    transformer = itemTransformer,
  }) {
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
        numericFilters: [
          `date < ${Date.now()/1000}`, // hide articles with future dates
         ]
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
          return items.map((item, index) => transformer(item, index));
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
    postsWrap.setAttribute('itemscope', '');
    postsWrap.setAttribute('itemtype', 'http://schema.org/Collection');
    getSection().parentNode.appendChild(postsWrap);
    setupSearch({
      hitsPerPage: 13,
      container: '.latest-posts',
      itemTemplate: `
      <div class="post" itemscope itemtype="http://schema.org/BlogPosting">
        <div class="hero">
          <a href="/{{path}}" title="{{{title}}}"><img class="lazyload" itemprop="image" content="{{hero}}" data-src="{{hero}}" alt="{{{title}}}"></a>
          <a itemprop="genre" href="{{topicUrl}}" title="{{{topic}}}">{{{topic}}}</a>
        </div>
        <div class="content">
          <span class="date" itemprop="datePublished" content="{{{dateISO}}}">{{{date}}}</span>
          <h2 itemprop="headline"><a href="/{{path}}" title="{{{title}}}">{{{title}}}</a></h2>
          <span class="teaser" itemprop="abstract">
            <a itemprop="url" href="/{{path}}" title="{{{teaser}}}…">{{{teaser}}}…</a>
          </span>
          <span class="author" itemprop="author" itemscope itemtype="http://schema.org/Person">
            <a itemprop="url" href="{{authorUrl}}" title="{{{author}}}"><span itemprop="name">{{{author}}}</span></a>
          </span>
        </div>
      </div>
      `,
      transformer: (item, index) => {
        item = itemTransformer(item); 
        if (index === 0) {
          // use larger hero image on first article
          item.hero = item.hero.replace('?width=256', '?width=2048');
        } 
        return item;
      },
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
      const dateISO = new Date(date).toISOString();
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
              authorDiv.innerHTML =
                `<div itemprop="author" itemscope itemtype="http://schema.org/Person">
                  <img class="lazyload" itemprop="image" content="${avatarURL}" data-src="${avatarURL}?width=120">
                  <span class="post-author">by <a itemprop="url" href="${pageURL}"><span itemprop="name">${author}</span></a></span>
                </div>
                <span class="post-date" itemprop="datePublished" content="${dateISO}">${date}</span>`;
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
          btn.setAttribute('itemprop', 'genre');
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
    latestWrap.setAttribute('itemscope', '');
    latestWrap.setAttribute('itemtype', 'http://schema.org/Collection');
    getSection().parentNode.appendChild(latestWrap);
    setupSearch({
      facetFilters: [
          filter,
        ],
      container: '.latest-posts',
      emptyTemplate,
    }).start();
  }

  function annotateSchema() {
    const main = document.querySelector('main');
    main.setAttribute('itemscope', '');
    main.setAttribute('itemtype', 'http://schema.org/BlogPosting');

    const header = getSection(0);
    if (header) {
      const headline = header.querySelector('h1');
      headline && headline.setAttribute('itemprop', 'headline');
    }
    
    const hero = getSection(1);
    if (hero) {
      const image = hero.querySelector('p > img');
      if (image) {
        image.setAttribute('itemprop', 'image');
        image.setAttribute('content', image.src.replace(/\?.*/, ''));
      }
      const subtitle = hero.querySelector('p + p');
      subtitle && subtitle.setAttribute('itemprop', 'abstract');
    }
    
    const content = getSection(3);
    if (content) {
      content.setAttribute('itemprop', 'text');
    }
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
      annotateSchema();
    } else if (isAuthor) {
      fetchSocialLinks();
      fetchLatestPosts(TYPE.AUTHOR);
    } else if (isTopic) {
      fetchLatestPosts(TYPE.TOPIC);
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

