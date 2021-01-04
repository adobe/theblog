const { expect } = require('chai');
const {
  startServer,
  stopServer,
  startBrowser,
  stopBrowser,
  TEST_URL,
} = require('./utils');

describe('Post', () => {
  let page;

  before(async function before() {
    this.timeout(120000);
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
    const testPages = [
      {
        path: '/en/publish/2020/12/17/future-of-government-modernizing-hr-teams-in-watershed-moment.html',
        links: ['e-signatures'],
      },
      {
        path: '/en/publish/2020/12/18/annual-end-of-year-predictions-cx-best-practices.html',
        links: ['customer intelligence', 'customer profiles', 'customer experience', 'customer data', 'customer journey'],
      },
      {
        path: '/en/publish/2020/10/23/optimize-email-deliverability-2020-holiday-season.html',
        links: [],
      }
    ]
    while (testPages.length > 0) {
      const { path, links } = testPages.shift();
      await page.goto(`${TEST_URL}${path}`, { waitUntil: 'load' });
      try {
        await page.waitForSelector('main .post-body a.interlink', { timeout: 5000 });
      } catch (e) {
          expect(0).to.equal(links.length);
      }
      const interlinks = await page.evaluate(() =>
        Array.from(document.querySelectorAll('main .post-body a.interlink')).map((a) => a.innerText));
      expect(interlinks).to.deep.equal(links);
    }
  }).timeout(1200000);
});
