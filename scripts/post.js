import {
  fetchArticles,
  addClass,
  getLink,
  wrap,
  createTag,
} from '/scripts/common.js';

/**
 * Decorates the post page with CSS classes
 */
export function decoratePostPage(){
  addClass('.post-page main>div:first-of-type', 'post-title');
  addClass('.post-page main>div:nth-of-type(2)', 'hero-image');
  addClass('.post-page main>div:nth-of-type(3)', 'post-author');
  addClass('.post-page main>div:nth-of-type(4)', 'post-body');
  addClass('.post-page main>div.post-body>p>img', 'images', 1);
  wrap('post-header',['main>div.category','main>div.post-title', 'main>div.post-author']);
  wrap('embed-promotions',['main>div.post-body>div.default:not(.banner)']);
  wrap('embed-promotions-text',['.embed-promotions>div>*:not(:first-child)']);
  addImageClasses();
}

/**
 * Adds CSS classes to images appearing within text
 */
export function addImageClasses() {
  document.querySelectorAll('.post-page .post-body img').forEach(($e) => {
    let hasText = false;
    $e.parentNode.childNodes.forEach(($c) => {
      if ($c.nodeName == '#text') hasText=true;
    })
    if (hasText) $e.parentNode.classList.add('left');
  })
}

/**
 * Fetches the author details from the author page and adds them to the post header
 */
export function fetchAuthor() {
  if (!window.blog.author) return;
  const authorSection = document.querySelector('.post-author');
  if (authorSection) {
    // clear the content of the div and replace by avatar and text
    authorSection.innerHTML = '';
    const xhr = new XMLHttpRequest();
    const fileName = window.blog.author.replace(/\s/gm, '-').toLowerCase();
    const pageURL = getLink(window.blog.TYPE.AUTHOR, window.blog.author);
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
            <div><span class="post-author"><a href="${pageURL}">${window.blog.author}</a></span>
            <span class="post-date">${window.blog.date}</span></div></div>`;
          authorDiv.classList.add('author');
          authorSection.appendChild(authorDiv);
        }
      } else {
        console.log('Author not found...', xhr.response);
      }
    };
    xhr.send();
  }
}

/**
 * Adds the primary topic as category to the post header
 */
export function addCategory() {
  if (!window.blog.topics || window.blog.topics.length === 0) return;
  const topic = window.blog.topics[0];
  const categoryWrap = document.createElement('div');
  const href = getLink(window.blog.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase());
  categoryWrap.className = 'default category';
  categoryWrap.innerHTML = `<a href="${href}" title="${topic}">${topic}</a>`;
  document.querySelector('main').appendChild(categoryWrap);
}

/**
 * Adds buttons for all topics to the bottom of the post
 */
export function addTopics() {
  if (!window.blog.topics || window.blog.topics.length === 0) return;
  const topicsWrap = createTag('div', { 'class' : 'default topics' });
  window.blog.topics.forEach((topic) => {
    const btn = createTag('a', {
      href: getLink(window.blog.TYPE.TOPIC, topic.replace(/\s/gm, '-').toLowerCase()),
      title: topic,
    });
    btn.innerText = topic;
    topicsWrap.appendChild(btn);
  });
  document.querySelector('main').appendChild(topicsWrap);
}

/**
 * Adds product details to the post.
 */
export function addProducts() {
  if (!window.blog.products || window.blog.products.length === 0) return;
  let html='<div class="prod-design">';
  const productsWrap = createTag('div', { 'class': 'default products' });
  window.blog.products.forEach((product) => {
    const productRef = product.replace(/\s/gm, '-').toLowerCase();
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

/**
 * Loads the GetSocial sharing tool
 */
export function loadGetSocial() {
  const po = createTag('script', {
    type: 'text/javascript',
    async: true,
    src: 'https://api.at.getsocial.io/get/v1/7a87046a/gs_async.js',
  });
  document.head.appendChild(po);
}

/**
 * Shapes promotional banners
 */
export function shapeBanners() {
  const banners = document.querySelectorAll('div.banner');
  banners.forEach((banner) => {
    // remove surrounding p
    banner.querySelectorAll('img, a').forEach((node) => {
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
    const imgs = banner.querySelectorAll('img');

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

    const title = banner.querySelector('h1');
    if (title) {
      left.append(title);
    }
    const p = banner.querySelector('p');
    if (p) {
      right.append(p);
    }

    const cta = banner.querySelector('a');
    if(cta) {
      right.append(cta);
    }
  });
}

window.addEventListener('load', function() {
  addCategory();
  decoratePostPage();
  fetchAuthor();
  addTopics();
  // addProducts();
  loadGetSocial();
  shapeBanners();
  fetchArticles();
});
