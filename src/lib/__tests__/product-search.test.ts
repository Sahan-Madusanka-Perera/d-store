import { describe, it, expect } from 'vitest';
import {
  buildSearchFilter,
  productMatchesSearch,
  matchedCategorySynonym,
} from '../product-search';

/**
 * The search term reaches PostgREST as part of an `or=(...)` filter string, which is a
 * small query language of its own. An unescaped comma or parenthesis there is not a
 * crash — it is extra filter clauses, chosen by whoever typed the search box. So the
 * escaping tests below are the security ones; the rest cover the drift this module was
 * written to prevent between the storefront's filter and the admin's in-memory matcher.
 */

describe('buildSearchFilter — injection into the PostgREST filter', () => {
  it('quotes a term containing a comma so it stays one value', () => {
    const filter = buildSearchFilter('a,b', 'all', false);
    // The comma must be inside quotes, not separating two clauses.
    expect(filter).toContain('"%a,b%"');
  });

  it('quotes parentheses rather than letting them close the group', () => {
    const filter = buildSearchFilter('x)', 'all', false);
    expect(filter).toContain('"%x)%"');
  });

  it('doubles an embedded double quote so it cannot end the quoted value', () => {
    const filter = buildSearchFilter('say "hi"', 'all', false);
    expect(filter).toContain('""hi""');
    expect(filter).not.toMatch(/[^"]"[a-z]/);
  });

  it('escapes SQL LIKE wildcards so they match literally', () => {
    // Without this, a search for "%" matches the entire catalogue in one query.
    const filter = buildSearchFilter('100%', 'all', false);
    expect(filter).toContain('100\\%');

    const underscore = buildSearchFilter('a_b', 'all', false);
    expect(underscore).toContain('a\\_b');
  });

  it('survives a term made entirely of filter syntax', () => {
    const nasty = '),name.eq.anything,(';
    const filter = buildSearchFilter(nasty, 'all', false);
    // Every clause is still one of ours: field.op.value, with the term quoted.
    for (const clause of filter.split(/,(?=[a-z_]+\.(?:ilike|cs|eq)\.)/)) {
      expect(clause).toMatch(/^[a-z_]+\.(ilike|cs|eq)\./);
    }
  });
});

describe('buildSearchFilter — scope', () => {
  it('searches the sitewide field set for "all"', () => {
    const filter = buildSearchFilter('naruto', 'all', false);
    for (const field of ['name', 'description', 'author', 'brand', 'series']) {
      expect(filter).toContain(`${field}.ilike.`);
    }
    expect(filter).toContain('character_names.cs.');
  });

  it('narrows the field set on a category page', () => {
    const filter = buildSearchFilter('naruto', 'manga', false);
    expect(filter).toContain('author.ilike.');
    expect(filter).not.toContain('brand.ilike.');
  });

  it('falls back to the sitewide scope for an unknown key', () => {
    expect(buildSearchFilter('x', 'not-a-category', false))
      .toBe(buildSearchFilter('x', 'all', false));
  });

  it('widens to a whole category only when asked', () => {
    expect(buildSearchFilter('manga', 'all', true)).toContain('category.eq.manga');
    expect(buildSearchFilter('manga', 'all', false)).not.toContain('category.eq.');
  });
});

describe('matchedCategorySynonym', () => {
  it('recognises true synonyms for a whole category', () => {
    expect(matchedCategorySynonym('figures')).toBe('figures');
    expect(matchedCategorySynonym('T-Shirts')).toBe('tshirts');
    expect(matchedCategorySynonym('  manga  ')).toBe('manga');
  });

  it('does not treat a subcategory as the whole category', () => {
    // The regression this guards: "Anime Figures" widening to every figure, so the
    // navbar link returned Gundam kits and Spider-Man too.
    expect(matchedCategorySynonym('anime figures')).toBeNull();
    expect(matchedCategorySynonym('gundam')).toBeNull();
  });
});

describe('productMatchesSearch — mirrors the database filter', () => {
  const product = {
    name: 'Naruto Vol. 1',
    description: 'Ninja adventure',
    author: 'Masashi Kishimoto',
    series: 'Naruto',
    tags: ['shounen'],
    character_names: ['Naruto Uzumaki'],
    category: 'manga',
  };

  it('matches text fields case-insensitively, as ilike does', () => {
    expect(productMatchesSearch(product, 'naruto', 'all')).toBe(true);
    expect(productMatchesSearch(product, 'NARUTO', 'all')).toBe(true);
    expect(productMatchesSearch(product, 'kishimoto', 'all')).toBe(true);
  });

  it('matches array elements exactly and case-sensitively, as `contains` does', () => {
    expect(productMatchesSearch(product, 'shounen', 'all')).toBe(true);
    expect(productMatchesSearch(product, 'Shounen', 'all')).toBe(false);
    expect(productMatchesSearch(product, 'shoun', 'all')).toBe(false);
  });

  it('respects the scope it is given', () => {
    const figure = { ...product, brand: 'Banpresto' };
    expect(productMatchesSearch(figure, 'banpresto', 'figures')).toBe(true);
    // `brand` is not in the manga scope.
    expect(productMatchesSearch(figure, 'banpresto', 'manga')).toBe(false);
  });

  it('returns false for an empty term rather than matching everything', () => {
    expect(productMatchesSearch(product, '', 'all')).toBe(false);
    expect(productMatchesSearch(product, '   ', 'all')).toBe(false);
  });

  it('handles missing fields without throwing', () => {
    expect(productMatchesSearch({}, 'anything', 'all')).toBe(false);
    expect(productMatchesSearch({ name: null, tags: null }, 'x', 'all')).toBe(false);
  });
});
