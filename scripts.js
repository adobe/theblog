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

  // wrap elements in div

  function wrapNodes(newparent, elems) {	
    elems.forEach((el, index) => {	
      newparent.appendChild(el.cloneNode(true));	
      if (newparent.children.length !== 1) {	
        el.parentNode.removeChild(el);	
      } else {	
        el.parentNode.replaceChild(newparent, el);	
      }	
    });	
  }	
  
  function wrap(classname, selectors) {	
    if (!Array.isArray(selectors)) {
      selectors=[selectors];
    }
    const div = document.createElement("div");	
    div.className = classname;	
  
    selectors.forEach((selector) => {
      const elems = document.querySelectorAll(selector);
      wrapNodes(div, elems);	
      })
  }

  // load language specific css overlays

  const loadCssFile = (path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  };

  if (window.helix.language !== window.LANG.EN) { // skip for en
    loadCssFile(`/dict.${window.helix.language}.css`);
  }

  const isHome = window.helix.pageType === window.TYPE.HOME;
  const isPost = window.helix.pageType === window.TYPE.POST;
  const isAuthor = window.helix.pageType === window.TYPE.AUTHOR;
  const isTopic = window.helix.pageType === window.TYPE.TOPIC;
  const isProduct = window.helix.pageType === window.TYPE.PRODUCT;

  const itemTransformer = (item) => {
    const itemParams = {
      hero: item.hero ? `${item.hero}?width=256&auto=webp` : '#',
      date: new Date(item.date * 1000).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      authorUrl: getLink(window.TYPE.AUTHOR, item.author),
      topic: item.topics.length > 0 ? item.topics[0] : '',
      topicUrl: item.topics.length > 0 ? getLink(window.TYPE.TOPIC, item.topics[0]) : '',
      path: !window.location.hostname.endsWith('.page') ? item.path.replace('/publish/', '/') : item.path,
    }
    return Object.assign({}, item, itemParams);
  };

  function addClass(selector, cssClass) {
    var el=document.querySelector(selector);
    if (el) el.classList.add(cssClass);
  } 

  function decoratePostPage(){
    addClass('.post-page main>div:first-of-type', 'post-title');
    addClass('.post-page main>div:nth-of-type(2)', 'hero-image');
    addClass('.post-page main>div:nth-of-type(3)', 'post-author');
    addClass('.post-page main>div:nth-of-type(4)', 'post-body');
    wrap('post-header',['main>div.category','main>div.post-title', 'main>div.post-author']);
  }

  function addPageTypeAsBodyClass() {
    document.body.classList.add(`${window.helix.pageType}-page`);
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
    const nodes = Array.from(document.querySelectorAll("main > div"));
    if (nodes.length === 0) {
      // create a section
      nodes.push(document.querySelector('main').appendChild(
        createTag('div', { class: 'default' })));
    }
    return index !== undefined && nodes.length > index ? nodes[index] : nodes[nodes.length - 1];
  }

  function getLink(type, name) {
    if (!type.endsWith('s')) type += 's';
    return `${window.helix.context}${window.helix.language}/${type}/${name.replace(/\s/gm, '-').replace(/\&amp;/gm,'').replace(/\&/gm,'').toLowerCase()}.html`;
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

  function helixQuery(appId, key) {
    return async (queries, hitsPerPage) => {
      if (!queries || queries.length === 0) return { hits: []};
      const url = new URL(`https://${appId}-dsn.algolia.net/1/indexes/*/queries`);
      const serializeQueryParameters = (q) => {
        const sp = new URLSearchParams();
        Object.entries(q)
          .filter(([key]) => key !== 'indexName' && key !== 'customSort')
          .forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => {
                sp.append(key, v);
              });
            } else {
              sp.append(key, value);
            }
          });
        return sp.toString();
      };
      const requests = queries.map(q => {
        return {
          indexName: q.indexName,
          params: serializeQueryParameters({ ...q, hitsPerPage }),
        };
      });

      /* fetch from algolia
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Algolia-API-Key': key,
          'X-Algolia-Application-Id': appId,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ requests }),
      });*/

      /*
      fetch locally for offline dev
      */
      const res = await fetch('/query-results.json', {
        method: 'GET'
      });

      const { results } = await res.json();
      if (!results) return [];
      results.forEach((result, i) => {
        const { customSort } = queries[i];
        if (customSort) {
          result.hits.sort(customSort);
        }
      });
      const hits = results
        .reduce((a, result) => {
          // concat all hits in all results
          a.push(...result.hits);
          return a;
        }, [])
        .reduce((unique, hit) => {
          return unique.find((item) => item.objectID === hit.objectID)
            ? unique : [...unique, hit];
        }, []);
      return { hits: hits.slice(0, hitsPerPage) };
    }
  }

  function setupSearch({
    indexName = 'adobe--theblog--blog-posts',
    hitsPerPage = 12,
    facetFilters = [],
    container = '.latest-posts',
    itemTemplate = document.getElementById('post-card'),
    emptyTemplate = 'There are no articles yet',
    transformer = itemTransformer,
  }) {
    const query = helixQuery('A8PL9E4TZT', '49f861a069d3c1cdb2c15f6db7929199');
    const filters = Array.from(facetFilters);
    const featured = getFeaturedPostsPaths();

    const queries = [];
    if (filters.length > 0 && filters[0].length > 0) {
      filters.push(`parents:${window.helix.context}${window.helix.language}`);
      filters.push(`date < ${Math.round(Date.now()/1000)}`); // hide articles with future dates
      queries.push({
        indexName,
        filters: filters.join(' AND '),
      });
    }

    if (featured.length) {
      queries.unshift({
        indexName,
        filters: featured.map(p => `path:${p.substr(1)}`).join(' OR '),
        customSort: (hit1, hit2) => featured.indexOf(`/${hit1.path}`) - featured.indexOf(`/${hit2.path}`),
      })
    }

    query(queries, hitsPerPage).then(({ hits }) => {
      if (emptyTemplate || (hits && hits.length > 0)) {
        let $el;
        if (typeof container === 'object') {
          // create container
          $el = document.createElement(container.tagName);
          container.classes.forEach((className) => $el.classList.add(className));
          container.parent.appendChild($el);
        } else {
          // find container
          $el = document.querySelector(container);
        }
        let $hits, $list;
        if ($el.querySelector('.ais-Hits')) {
          $hits=$el.querySelector('.ais-Hits');
          $list=$el.querySelector('.ais-Hits-list');
        } else {
          $hits=document.createElement('div');
          $hits.classList.add('ais-Hits');
          $el.appendChild($hits);
          if (!hits || hits.length === 0) {
            const $empty = document.createElement('div');
            $empty.textContent = emptyTemplate;
            $hits.appendChild($empty);
          } else {
          $list = document.createElement('ol');
          $list.classList.add('ais-Hits-list');
          $hits.appendChild($list);
          }
        }
        if (hits) {
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
          // add button to load more
          const $more = createTag('a', { 'class': 'load-more' });
          $more.addEventListener('click', function () { alert('Not implemented yet.'); });
          $hits.appendChild($more);
        }
      }
    });
  }

  function getFeaturedPostsPaths() {
    const featured=[];
    const $featured=document.getElementById('featured-posts');
    if ($featured) {
      $featured.parentNode.querySelectorAll('a').forEach((e) => {
        const url=new URL(e.getAttribute('href'));
        let path = url.pathname;
        const p = path.split('/');
        if (p.length >= 3 && p[2] !== 'drafts' && p[2] !== 'publish') {
          // re-add /publish/ for the query
          p.splice(2, 0, 'publish');
          path = p.join('/');
        }
        featured.push(path);
      });
      $featured.parentNode.remove();
    }
    return featured;
  }

  function createTag(name, attrs) {
    const el = document.createElement(name);
    if (typeof attrs === 'object') {
      for (let [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }
    }
    return el;
  }

  /*
   * homepage
   */

  function setupHomepage() {
    if (!document.title) {
      document.title = 'The Blog | Welcome to the Adobe Blog';
    }
    const titleSection = getSection(0);
    if (titleSection.innerText.trim() === document.title) {
      titleSection.remove();
    }

    const postsWrap = document.createElement('div');
    postsWrap.className = 'default latest-posts';
    document.querySelector('main').appendChild(postsWrap);

    setupSearch({
      hitsPerPage: 13,
      container: '.latest-posts',
      itemTemplate: document.getElementById('homepage-card'),
      transformer: (item, index) => {
        item = itemTransformer(item);
        if (index === 0) {
          // use larger hero image on first article
          item.hero = item.hero ? item.hero.replace('?width=256', `?width=${window.innerWidth <= 900 ? 900 : 2048}`) : '#';
        }
        return item;
      },
    });
  }

  /*
   * post page
   */

  function formatLocalDate(date) {
      const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
      ];  
      const dateObj = date.split('-');
  
      return monthNames[parseInt(dateObj[0])] + " " + dateObj[1] + ", " + dateObj[2];
  }

  function handleMetadata() {
    // store author and date
    const r = /^By (.*)\n*(.*)$/gmi.exec(getSection(2).innerText);
    window.helix.author = r && r.length > 0 ? r[1] : '';
    const d = r && r.length > 1 ? /\d{2}[.\/-]\d{2}[.\/-]\d{4}/.exec(r[2]) : null;
    window.helix.date = d && d.length > 0 ? formatLocalDate(d[0]) : '';
    // store topics
    const last = getSection();
    let topics, topicContainer;
    Array.from(last.children).forEach((i) => {
      const r = /^Topics\: ?(.*)$/gmi.exec(i.innerText);
      if (r && r.length > 0) {
        topics = r[1].split(/\,\s*/);
        topicContainer = i;
      }
    });
    window.helix.topics = topics
      ? topics.filter((topic) => topic.length > 0)
      : [];
    if (topicContainer) {
      topicContainer.remove();
    }
    // store products
    let products, productContainer;
    Array.from(last.children).forEach((i) => {
      const r = /^Products\: ?(.*)$/gmi.exec(i.innerText);
      if (r && r.length > 0) {
        products = r[1].split(/\,\s*/);
        productContainer = i;
      }
    });
    window.helix.products = products
    ? products.filter((product) => product.length > 0)
    : [];
    if (productContainer) {
      productContainer.remove();
    }
    if (last.innerText.trim() === '') {
      last.remove(); // remove empty last div
    }

    const md = [{
      property: 'og:locale',
      content: window.helix.language,
    },{
      property: 'article:published_time',
      content: window.helix.date ? new Date(window.helix.date).toISOString() : '',
    }];
    // add topics and products as article:tags
    [...window.helix.topics].forEach((topic) => md.push({
        property: 'article:tag',
        content: topic,
    }));
    [...window.helix.products].forEach((product) => md.push({
      property: 'article:tag',
      content: `Adobe ${product}`,
    }));
    // add meta tags to DOM
    const frag = document.createDocumentFragment();
    md.forEach((meta) => {
      frag.appendChild(createTag('meta', { property: meta.property, content: meta.content }));
    });
    document.head.append(frag);
  }

  function addAuthor() {
    if (!window.helix.author) return;
    const authorSection = document.querySelector('.post-author');
    if (authorSection) {
      // clear the content of the div and replace by avatar and text
      authorSection.innerHTML = '';
      const xhr = new XMLHttpRequest();
      const fileName = window.helix.author.replace(/\s/gm, '-').toLowerCase();
      const pageURL = getLink(TYPE.AUTHOR, window.helix.author);
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
            authorDiv.innerHTML = `<div class="author-summary"><img class="lazyload" data-src="${avatarURL}">
              <div><span class="post-author"><a href="${pageURL}">${window.helix.author}</a></span>
              <span class="post-date">${window.helix.date}</span></div></div>`;
            authorDiv.classList.add('author');
            // try to get the author's social links
            const socialLinks = /<p>(Social\: .*)<\/p>/gi.exec(xhr.responseText);
            if (socialLinks) {
              const $social = document.createElement('div');
              $social.innerHTML = socialLinks[1];
              fetchSocialLinks($social, authorDiv);
            }
            authorSection.appendChild(authorDiv);
          }
        } else {
          console.log('Author not found...', xhr.response);
        }
      };
      xhr.send();
    }
  }

  function addCategory() {
    if (!window.helix.topics || window.helix.topics.length === 0) return;
    const topic = window.helix.topics[0];
    const categoryWrap = document.createElement('div');
    categoryWrap.className = 'default category';
    const href=getLink(window.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase());
    categoryWrap.innerHTML = `<a href="${href} title=${topic}">${topic}</a>`;
    document.querySelector('main').appendChild(categoryWrap);
  }

  function addTopics() {
    if (!window.helix.topics || window.helix.topics.length === 0) return;
    const topicsWrap = document.createElement('div');
    topicsWrap.className = 'default topics';
    window.helix.topics.forEach((topic) => {
      const btn = document.createElement('a');
      btn.href = getLink(window.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase());
      btn.title = topic;
      btn.innerText = topic;

      topicsWrap.appendChild(btn);
    });
    document.querySelector('main').appendChild(topicsWrap);
  }

  function addProducts() {
    if (!window.helix.products || window.helix.products.length === 0) return;
    let html='<div class="prod-design">';
    const productsWrap = document.createElement('div');
    productsWrap.className = 'default products';
    window.helix.products.forEach((product) => {
      const productRef = product.replace(/\s/gm, '-').toLowerCase();

      const btn = document.createElement('a');
      btn.href = `https://www.adobe.com/${productRef}.html`;
      btn.title = product;

      const img = document.createElement('img');
      img.src = `/icons/${productRef}.svg`;
      img.alt = product;

      html += `<div>
      <a title=Adobe ${product} href="https://www.adobe.com/${productRef}.html"><img alt={product} src="/icons/${productRef}.svg"></a>
      <p>Adobe ${product}</p>
      <p><a class="learn-more" href="https://www.adobe.com/${productRef}.html"></a></p>
      </div>`;

    });
    html += '</div>';
    productsWrap.innerHTML = html;
    document.querySelector('main').appendChild(productsWrap);
  }

  function addGetSocial() {
    const po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://api.at.getsocial.io/get/v1/7a87046a/gs_async.js';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
  }

  function shapeBanner() {
    const banners = document.querySelectorAll('div.banner');
    banners.forEach((banner) => {
      // remove surrounding p
      document.querySelectorAll('.banner img, .banner a').forEach((node) => {
        const p = node.parentNode;
        p.parentNode.insertBefore(node, p);
        p.remove();
      });

      const left = document.createElement('div');
      const right = document.createElement('div');
      left.classList.add('banner-left');
      right.classList.add('banner-right');

      banner.append(left);
      banner.append(right);

      let backgroundImg;
      let logoImg;
      const imgs = document.querySelectorAll('.banner img');

      if (imgs.length == 2) {
        // easy case, 2 images in the banner
        backgroundImg = imgs[0];
        logoImg = imgs[1];
      } else {
        if (imgs.length == 1) {
          // need to find: img before a -> background or img after a -> logo
          for (let i = 0; i < banner.childNodes.length; i++) {
            const node = banner.childNodes[i];
            if (node.tagName === 'A') {
              // reached the a
              logoImg = imgs[0];
              break;
            }
            if (node === imgs[0]) {
              // still before a
              backgroundImg = imgs[0];
              break;
            }
          }
        }
      }

      if (backgroundImg) {
        banner.style['background-image'] = `url(${backgroundImg.dataset.src})`;
        backgroundImg.remove();
      }

      if (logoImg) {
        left.append(logoImg);
      }

      const title = document.querySelector('.banner > h1');
      if (title) {
        left.append(title);
      }
      const p = document.querySelector('.banner > p');
      if (p) {
        right.append(p);
      }

      const cta = document.querySelector('.banner a');
      if(cta) {
        right.append(cta);
      }
    });
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

  function logHitJSON() {
    const path=window.location.pathname;
    const title = document.querySelector("h1").innerText;
    const $last = getSection();
    const $author = getSection(2); 
    const $blogpost = getSection(3); 
    let topics="";
    let products="";
    let author="";
    let date="";
    let teaser="";

    if ($last) {
      topics = /^Topics\: ?(.*)$/gmi.exec($last.innerText)[1].split(',').map((e) => e.trim());
      products = /^Products\: ?(.*)$/gmi.exec($last.innerText)[1].split(',').map((e) => e.trim());;
    }

    if ($author) {
      author = /^By (.*)\n*(.*)$/gmi.exec($author.innerText)[1];
      date = /^posted on (.*)\n*(.*)$/gmi.exec($author.innerText)[1];
      const splits =date.split('-');
      console.logs
      date=new Date(`${splits[2]}-${splits[0]}-${splits[1]}`).getTime()/1000;
    }

    if ($blogpost) {
      teaser=$blogpost.innerText.substr(0,512);
    }

    const hero=new URL(document.querySelector('main>div:nth-of-type(2) img').getAttribute('src')).pathname;
  
    console.log(JSON.stringify({ path: path, 
      topics: topics,
      products: products,
      hero: hero,
      date: date,
      title: title,
      teaser: teaser,
      author: author,
      objectID: ''+Math.random(),

    }, null, "  ")+", ");
  }

  function fetchLatestPosts() {
    let filter, emptyTemplate;
    if (isPost) {
      filter = '';
      emptyTemplate = '';
    } else if (isTopic) {
      filter = `topics:"${document.title}"`;
      emptyTemplate = 'There are no articles in this topic yet';
    } else if (isAuthor) {
      filter = `author:"${document.title.split(',')[0]}"`;
      emptyTemplate = 'This author has not posted any articles yet.';
    }
    setupSearch({
      facetFilters: [
          filter,
        ],
      emptyTemplate,
      container: {
        tagName: 'div',
        parent: getSection().parentNode,
        classes: ['default', 'latest-posts'],
      },
    });
  }

  window.onload = function() {
    removeHeaderAndFooter();
    addPageTypeAsBodyClass();
    handleMetadata();
    scrani.onload();
    if (isHome) {
      setupHomepage();
    } else if (isPost) {
      // logHitJSON();
      addCategory();
      decoratePostPage();
      addAuthor();
      addTopics();
      addProducts();
      addGetSocial();
      shapeBanner();
      fetchLatestPosts();
    } else if (isAuthor) {
      fetchSocialLinks();
      fetchLatestPosts();
    } else if (isTopic) {
      fetchLatestPosts();
    } else if (isProduct) {
      // todo
    }
  };
