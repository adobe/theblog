<div id="feds-footer"></div>
<script>
// prep images for lazy loading
let count = 0;
Array.from(document.querySelectorAll('img')).forEach((img, index) => {
  // skip non-hlx images
  if (/\/hlx_/.test(img.src)) {
    // skip hero image
    if (count > 0) { 
      const src = img.src;
      img.removeAttribute('src');
      img.classList.add('lazyload');
      img.setAttribute('data-src', src);
    }
    count++;
  }
});
</script>
