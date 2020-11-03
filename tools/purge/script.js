async function purge() {
    const $test=document.getElementById('test_location');
    let loc=window.location.href;
    if ($test) loc=$test.value;

    const url=new URL(loc);
    let path=url.pathname;

    console.log(`purging for path: ${path}`)
    await sendPurge(path);
    if (path.includes('/publish/')) {
        path=path.replace('/publish/','/');
        console.log(`purging for path: ${path}`)
        await sendPurge(path);
    }
    const outerURL=`https://blog.adobe.com${path}`;

    const resp=await fetch(outerURL, {cache: 'reload', mode: 'no-cors'});

    console.log(`redirecting ${outerURL}`);
    window.location.href=outerURL;            
}

async function sendPurge(path) {
    const resp=await fetch(`https://adobeioruntime.net/api/v1/web/helix/helix-services/purge@v1?host=theblog--adobe.hlx.page&xfh=blog.adobe.com&path=${path}`, {
        method: 'POST'
    });
    const json=await resp.json();
    console.log(JSON.stringify(json));
    if (!resp.ok || json.status !== 'ok') {
        alert(`Failed to purge ${path} from the cache. Please try again later.\n\nStatus: ${resp.status}\n\n${JSON.stringify(json)}`);
    }
    return json;
}

purge();