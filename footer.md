---

- <svg><use xlink:href="/icons.svg#adobe"></use></svg>
- <svg><use xlink:href="/icons.svg#facebook"></use></svg>
- <svg><use xlink:href="/icons.svg#instagram"></use></svg>
- <svg><use xlink:href="/icons.svg#linkedin"></use></svg>
- <svg><use xlink:href="/icons.svg#twitter"></use></svg>
- <svg><use xlink:href="/icons.svg#youtube"></use></svg>

---

- My Feed
- [Need Help?](https://helpx.adobe.com/contact.html)
- [Privacy Policy](https://www.adobe.com/privacy.html)
- [Terms of Use](https://www.adobe.com/legal/terms.html)
- :adchoices: AdChoices

---

Copyright &copy; 2019 Adobe. All rights reserved.

---
<script src="https://cdn.jsdelivr.net/npm/algoliasearch@3/dist/algoliasearch.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/instantsearch.js@4.0.0/dist/instantsearch.production.min.js" integrity="sha256-6S7q0JJs/Kx4kb/fv0oMjS855QTz5Rc2hh9AkIUjUsk=" crossorigin="anonymous"></script>
<script type="text/html" id="post-template">
  <div class="related-topics__base hit">
    <div class="related-topics__wrapper hit-content">
      <div class="related-topics__thumb hit-image">
        <img src="{{hero}}" alt="{{name}}">
      </div>
      <a class="related-topics__link hit-view" href="/{{path}}" target="_new">
        <span class="related-topics__txt hit-description">{{{author}}}</span>
        <h2 class="related-topics__subHl hit-name">{{{title}}}</h2>
        <span class="related-topics__txt hit-description">{{{date}}}</span>
      </a>
    </div>
  </div>
</script>
<script>
  if (getPageType(window.location.pathname) === 'authors') {
    const latestWrap = document.createElement('div');
    latestWrap.className = 'default latest-posts';
    getSection().parentNode.appendChild(latestWrap);

    const searchClient = algoliasearch('A8PL9E4TZT', 'c5f99b37bfef18fd6ad1c440b5abd6c9');
    const search = instantsearch({
      indexName: 'davidnuescheler--theblog--blogposts',
      searchClient,    
      routing: true,
    });

    search.addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage: 10,
      })
    ]);

    search.addWidgets([
      instantsearch.widgets.hits({
        container: '.latest-posts',
        templates: {
          item: document.getElementById('post-template').innerHTML,
          empty: 'This author has not posted anything yet.',
        },
      })
    ]);
    search.start();
  }
</script>