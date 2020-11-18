
import { getTaxonomy } from '../../scripts/taxonomy.js';

describe('Taxonomy', async () => {
  const taxonomy = await getTaxonomy(null, '/base/test/features/taxonomy/en.json');

  it('getTaxonomy#isUFT', () => {
    expect(taxonomy.isUFT('Top100')).to.be.true;
    expect(taxonomy.isUFT('Top200')).to.be.false;
  });

  it('getTaxonomy#skipMeta', () => {
    expect(taxonomy.skipMeta('Top300')).to.be.true;
    expect(taxonomy.skipMeta('Top211')).to.be.false;
  });

  it('getTaxonomy#getParents', () => {
    // level 3
    expect(taxonomy.getParents('Top211')).to.eql(['Top210', 'Top200']);
    expect(taxonomy.getParents('Top212')).to.eql(['Top210', 'Top200']);
    expect(taxonomy.getParents('Top241')).to.eql(['Top240', 'Top200']);
    
    // level 2
    expect(taxonomy.getParents('Top210')).to.eql(['Top200']);
    expect(taxonomy.getParents('Top220')).to.eql(['Top200']);
    expect(taxonomy.getParents('Top230')).to.eql(['Top200']);
    expect(taxonomy.getParents('Top240')).to.eql(['Top200']);

    // level 1
    expect(taxonomy.getParents('Top100')).to.eql([]);
    expect(taxonomy.getParents('Top200')).to.eql([]);
    expect(taxonomy.getParents('Top300')).to.eql([]);

    // not existing
    expect(taxonomy.getParents('Top110')).to.eql([]);
  });

  it('getTaxonomy#getChildren', () => {
    expect(taxonomy.getChildren('Top100')).to.eql([]);
    expect(taxonomy.getChildren('Top200')).to.eql(['Top210', 'Top220', 'Top230', 'Top240']);
    expect(taxonomy.getChildren('Top210')).to.eql(['Top211', 'Top212']);
    expect(taxonomy.getChildren('Top220')).to.eql([]);
    expect(taxonomy.getChildren('Top240')).to.eql(['Top241']);
    expect(taxonomy.getChildren('Top214')).to.eql([]);
    expect(taxonomy.getChildren('Top300')).to.eql([]);
  });

  it('getTaxonomy#getCategory', () => {
    const internals = taxonomy.getCategory(taxonomy.INTERNALS);
    expect(internals.length).to.equal(1);
    expect(internals[0].name).to.equal('Top300');
    expect(internals[0].level).to.equal(1);

    const categories = taxonomy.getCategory(taxonomy.CATEGORIES);
    expect(categories.length).to.equal(9);
    expect(categories[0].name).to.equal('Top100');
    expect(categories[0].level).to.equal(1);
    expect(categories[1].name).to.equal('Top200');
    expect(categories[1].level).to.equal(1);
    expect(categories[2].name).to.equal('Top210');
    expect(categories[2].level).to.equal(2);
    expect(categories[3].name).to.equal('Top211');
    expect(categories[3].level).to.equal(3);
  });
});