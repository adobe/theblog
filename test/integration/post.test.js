const { expect } = require('chai');
const {
  startServer,
  stopServer,
  startBrowser,
  stopBrowser,
  readFile,
  TEST_URL,
} = require('./utils');

describe('Post', () => {
  let page;

  before(async function before() {
    this.timeout(240000);
    await startServer();
  });

  beforeEach(async () => {
    page = await startBrowser();
  });

  afterEach(async () => {
    page = await stopBrowser();
  });

  after(() => stopServer());

  it('Renders the expected interlinks', async () => {
    let testPage;
    const testPages = [
      {
        path: '/en/publish/2020/12/17/future-of-government-modernizing-hr-teams-in-watershed-moment.html',
        static: 'features/interlink/static01.html',
        links: ['e-signatures', 'digital asset'],
      },
      {
        path: '/en/publish/2020/12/18/annual-end-of-year-predictions-cx-best-practices.html',
        static: 'features/interlink/static02.html',
        links: ['customer intelligence', 'customer profiles', 'social media platforms', 'customer experience', 'customer data', 'omnichannel', 'customer journey', 'personalized content'],
      },
      {
        path: '/en/publish/2020/10/23/optimize-email-deliverability-2020-holiday-season.html',
        static: 'features/interlink/static03.html',
        links: [],
      }
    ];

    async function deliverStatic(req) {
      const rpath = new URL(req.url()).pathname;
      if (testPage.path === rpath) {
        req.respond({
          status: 200,
          contentType: 'text/html;charset=utf-8',
          body: await readFile(testPage.static),
        });
      } else if (rpath === '/en/keywords.json') {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: await readFile('features/interlink/keywords.json'),
        })
      } else {
        req.continue();
      }
    }

    await page.setRequestInterception(true);
    // load test pages
    while (testPages.length > 0) {
      testPage = testPages.shift();
      const { path, links } = testPage;
      console.log(`  Testing ${path}`);
      page.on('request', deliverStatic);
      await page.goto(`${TEST_URL}${path}`, { waitUntil: 'load' });
      try {
        await page.waitForSelector('main .post-body a.interlink', { timeout: 5000 });
      } catch (e) {
        // expected number of links must be 0
        expect(0).to.equal(links.length);
      }
      const interlinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll('main .post-body a.interlink')).map((a) => a.innerText));
      expect(interlinks).to.deep.equal(links);
      page.off('request', deliverStatic);
    }
  }).timeout(360000);
});
