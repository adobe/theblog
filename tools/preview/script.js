(() => {
  const $script = document.scripts[document.scripts.length - 1];
  const c = JSON.parse($script.getAttribute('data-config'));
  c.project = c.project || 'your Helix Pages project';
  const hostSegments = c.innerHost.split('--');
  if (hostSegments.length > 1) {
    c.ref = hostSegments.length === 3 ? hostSegments.shift() : null;
    c.repo = hostSegments.shift();
    c.owner = hostSegments.shift().split('.')[0];
  }
  c.ref = c.ref || 'master';
  if (!c.owner || !c.repo || !c.outerHost) {
    alert(`Helix Pages Preview Bookmarklet misconfigured for ${c.project}.`);
    return;
  }
  let loc = window.location;
  const $test=document.getElementById('test_location');
  if ($test && $test.value) {
    try {
      loc = new URL($test.value);
    } catch (e) {
      alert(`Malformed Test URL: ${$tst.value}`);
      return;
    }
  }
  const currentHost=loc.hostname;
  const currentPath=loc.pathname;

  c.id = `hlxPreview-${c.ref}--${c.repo}--${c.owner}`;
  c.innerHost=`${c.ref !== 'master' && c.ref !== 'main' ? `${c.ref}--` : ''}${c.repo}--${c.owner}.hlx.page`;
  if (/.*\.sharepoint\.com/.test(currentHost)
    || currentHost.startsWith('https://docs.google.com')) {
    // source document, open window with staging url
    const u = new URL('https://adobeioruntime.net/api/v1/web/helix/helix-services/content-proxy@v1');
    u.search = new URLSearchParams([
      ['owner', c.owner],
      ['repo', c.repo],
      ['ref', c.ref],
      ['path', '/'],
      ['lookup', loc.href],
    ]).toString();
    const win = window.open(u, c.id);
  } else {
    switch (currentHost) {
      case c.innerHost: {
        // staging, switch to production
        window.location.href = `https://${c.outerHost}${currentPath.replace('/publish', '')}`;
        break;
      }
      case c.outerHost: {
        // production, switch to staging
        window.location.href = `https://${c.innerHost}${currentPath.replace(/^\/(.*)\/(\d{4})/, '/$1/publish/$2')}`;
        break;
      }
      default: {
        alert(`Helix Pages Preview Bookmarklet allows you to preview pages on ${c.project}.\n\nTry it on a valid source document, or any page on:\nhttps://${c.innerHost}/\nhttps://${c.outerHost}/`);
      }
    }
  }
})();
