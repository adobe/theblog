import { checkAndAddMatch } from '../../scripts/post.js';

describe('Interlinks', () => {
  const maxMatches = 10;
  const matches = [];

  it('adds new match', () => {
    checkAndAddMatch(matches, {
      item: {},
      start: 3,
      end: 11,
    }, maxMatches);
    expect(matches.length).to.equal(1);
  });

  it('detects collision at the start', () => {
    checkAndAddMatch(matches, {
      item: {},
      start: 0,
      end: 7,
    }, maxMatches);
    expect(matches.length).to.equal(1);
    expect(matches[0].start).to.equal(3);
  });

  it('detects collision at the end', () => {
    checkAndAddMatch(matches, {
      item: {},
      start: 4,
      end: 12,
    }, maxMatches);
    expect(matches.length).to.equal(1);
    expect(matches[0].start).to.equal(3);
  });

  it('adds non-colliding match', () => {
    checkAndAddMatch(matches, {
      item: {},
      start: 13,
      end: 20,
    }, maxMatches);
    expect(matches.length).to.equal(2);
  });

  it('respects maximum matches', () => {
    checkAndAddMatch(matches, {
      item: {},
      start: 21,
      end: 31,
    }, 2);
    expect(matches.length).to.equal(2);
  });
});
