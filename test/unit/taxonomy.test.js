
import { getTaxonomy } from '../../scripts/taxonomy.js';

let taxonomy;

before(async () => {
  taxonomy = await getTaxonomy(null, '/base/test/features/taxonomy/en.json');
});

describe('Taxonomy', () => {
  it('getTaxonomy#get', () => {
    const top100 = taxonomy.get('Top100');
    expect(top100.name).to.equal('Top100');
    expect(top100.level).to.equal(1);
    expect(top100.link).to.be.null;
    expect(top100.isUFT).to.be.true;
    expect(top100.skipMeta).to.be.false;
    expect(top100.parents).to.eql([]);
    expect(top100.children).to.eql([]);
    expect(top100.category).to.eql('Categories');

    const top210 = taxonomy.get('Top210');
    expect(top210.name).to.equal('Top210');
    expect(top210.level).to.equal(2);
    expect(top210.link).to.be.null;
    expect(top210.isUFT).to.be.true;
    expect(top210.skipMeta).to.be.true;
    expect(top210.parents).to.eql(['Top200']);
    expect(top210.children).to.eql(['Top211', 'Top212']);
    expect(top210.category).to.eql('Categories');

    const top211 = taxonomy.get('Top211');
    expect(top211.name).to.equal('Top211');
    expect(top211.level).to.equal(3);
    expect(top211.link).to.equal('http://localhost:9876/alinktoTop211');
    expect(top211.isUFT).to.be.true;
    expect(top211.skipMeta).to.be.false;
    expect(top211.parents).to.eql([ 'Top210', 'Top200']);
    expect(top211.children).to.eql([]);
    expect(top211.category).to.eql('Categories');
  });

  it('getTaxonomy#get can find by category', () => {
    const product241 = taxonomy.get('Top241', taxonomy.PRODUCTS);
    expect(product241).to.not.be.null;
    expect(product241.category).to.not.be.null;
    expect(product241.category.toLowerCase()).to.equal(taxonomy.PRODUCTS);

    const category241 = taxonomy.get('Top241', taxonomy.CATEGORIES);
    expect(category241).to.not.be.null;
    expect(category241.category).to.not.be.null;
    expect(category241.category.toLowerCase()).to.equal(taxonomy.CATEGORIES);
  });

  it('getTaxonomy#lookup products have priority', () => {
    const top241 = taxonomy.lookup('Top241',);
    expect(top241).to.not.be.null;
    expect(top241.category).to.not.be.null;
    expect(top241.category.toLowerCase()).to.equal(taxonomy.PRODUCTS);
  });

  it('getTaxonomy#lookup finds a tag', () => {
    const top100 = taxonomy.lookup('Top100',);
    expect(top100).to.not.be.null;
    expect(top100.category).to.not.be.null;
    expect(top100.category.toLowerCase()).to.equal(taxonomy.CATEGORIES);
  });

  it('getTaxonomy#lookup finds Adobe products', () => {
    const top241 = taxonomy.lookup('Adobe Top241',);
    expect(top241).to.not.be.null;
    expect(top241.category).to.not.be.null;
    expect(top241.category.toLowerCase()).to.equal(taxonomy.PRODUCTS);
  });

  it('getTaxonomy#lookup does not find a tag with Adobe', () => {
    const top100 = taxonomy.lookup('Adobe Top100',);
    expect(top100).to.be.null;
  });

  it('getTaxonomy#isUFT', () => {
    expect(taxonomy.isUFT('Top100')).to.be.true;
    expect(taxonomy.isUFT('Top200')).to.be.false;
  });

  it('getTaxonomy#isUFT makes difference between categories', () => {
    expect(taxonomy.isUFT('Top241')).to.be.true;
    expect(taxonomy.isUFT('Top241', taxonomy.CATEGORIES)).to.be.true;
    expect(taxonomy.isUFT('Top241', taxonomy.PRODUCTS)).to.be.false;
  });

  it('getTaxonomy#skipMeta', () => {
    expect(taxonomy.skipMeta('Top300')).to.be.true;
    expect(taxonomy.skipMeta('Top211')).to.be.false;
  });

  it('getTaxonomy#skipMeta makes difference between categories', () => {
    expect(taxonomy.skipMeta('Top241')).to.be.false;
    expect(taxonomy.skipMeta('Top241', taxonomy.CATEGORIES)).to.be.false;
    expect(taxonomy.skipMeta('Top241', taxonomy.PRODUCTS)).to.be.true;
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

  it('getTaxonomy#getParents makes difference between categories', () => {

    expect(taxonomy.getParents('Top241')).to.eql(['Top240', 'Top200']);
    expect(taxonomy.getParents('Top241', taxonomy.CATEGORIES)).to.eql(['Top240', 'Top200']);
    expect(taxonomy.getParents('Top241', taxonomy.PRODUCTS)).to.eql(['Top240', 'Top400']);
  });

  it('getTaxonomy#getParents accept arrays', () => {
    expect(taxonomy.getParents(['Top211', 'Top212', 'Top241'])).to.eql(['Top210', 'Top200', 'Top240']);
    expect(taxonomy.getParents(['Top210', 'Top211'])).to.eql(['Top200', 'Top210']);
    
    // with non existing
    expect(taxonomy.getParents(['Top110', 'Top211'])).to.eql(['Top210', 'Top200']);
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

  it('getTaxonomy#getChildren makes difference between categories', () => {
    expect(taxonomy.getChildren('Top200')).to.eql(['Top210', 'Top220', 'Top230', 'Top240']);
    expect(taxonomy.getChildren('Top200', taxonomy.CATEGORIES)).to.eql(['Top210', 'Top220', 'Top230', 'Top240']);
    expect(taxonomy.getChildren('Top200', taxonomy.PRODUCTS)).to.eql([]);
    expect(taxonomy.getChildren('Top240')).to.eql(['Top241']);
    expect(taxonomy.getChildren('Top240', taxonomy.CATEGORIES)).to.eql(['Top241']);
    expect(taxonomy.getChildren('Top240', taxonomy.PRODUCTS)).to.eql(['Top241', 'Top242']);
  });

  it('getTaxonomy#getCategory', () => {
    const internals = taxonomy.getCategory(taxonomy.INTERNALS);
    expect(internals.length).to.equal(1);
    expect(internals[0]).to.equal('Top300');

    const categories = taxonomy.getCategory(taxonomy.CATEGORIES);
    expect(categories.length).to.equal(9);
    expect(categories[0]).to.equal('Top100');
    expect(categories[1]).to.equal('Top200');
    expect(categories[2]).to.equal('Top210');
    expect(categories[3]).to.equal('Top211');
  });

  it('getTaxonomy#getCategory duplicates allowed in different categories', () => {
    const internals = taxonomy.getCategory(taxonomy.PRODUCTS);
    expect(internals.length).to.equal(5);
    expect(internals[2]).to.equal('Top241');

    const categories = taxonomy.getCategory(taxonomy.CATEGORIES);
    expect(categories.length).to.equal(9);
    expect(categories[8]).to.equal('Top241');
  });
});