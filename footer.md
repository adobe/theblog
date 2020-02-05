<div id="feds-footer"></div>
<script>
// prep images for lazy loading and add proper size
let count = 0;
Array.from(document.querySelectorAll('img')).forEach((img, index) => {
  // skip non-hlx images
  if (/\/hlx_/.test(img.src)) {
    // todo: use srcset and sizes attribute for full responsiveness
    img.setAttribute('data-src', `${img.src}?width=${window.innerWidth}`);
    img.removeAttribute('src');
    img.classList.add('lazyload');
    count++;
  }
});
</script>
