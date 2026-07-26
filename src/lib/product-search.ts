/**
 * One definition of "which products match this search term", shared by the storefront
 * category pages and the admin Inventory Matrix.
 *
 * The storefront filters in the database (PostgREST `or=` syntax) and the admin counts
 * in memory, so the rule is expressed twice — but from the same field lists and synonym
 * tables below, so the two can't drift apart. They previously did: the admin matrix
 * reported 3 products under "Anime Figures" while the storefront link returned all 14.
 */

export interface SearchScope {
  /** Columns matched with a case-insensitive substring search (ilike) */
  textFields: string[];
  /** Array columns matched with "array contains" — exact, case-sensitive elements */
  arrayFields: string[];
}

/** Which columns each category page searches. `all` is the sitewide /products search. */
export const SEARCH_SCOPES: Record<string, SearchScope> = {
  all: { textFields: ['name', 'description', 'author', 'brand', 'series'], arrayFields: ['character_names', 'tags'] },
  manga: { textFields: ['name', 'description', 'author', 'series'], arrayFields: ['tags'] },
  figures: { textFields: ['name', 'description', 'brand', 'series'], arrayFields: ['tags'] },
  tshirts: { textFields: ['name', 'description', 'brand', 'series'], arrayFields: ['tags'] },
  other: { textFields: ['name', 'description', 'brand', 'series'], arrayFields: ['tags'] },
};

/**
 * Search terms that mean "show me this whole category", so searching "figures" on the
 * figures page returns everything rather than only products with "figures" in the name.
 *
 * A subcategory name must never appear here. 'anime figures' used to, which meant the
 * navbar's "Anime Figures" link (/figures?search=Anime+Figures) widened to every figure —
 * Gundam kits and Spider-Man included. Entries below are true synonyms for the whole
 * category: every product in `tshirts` really is a graphic tee, but only some figures
 * are anime figures.
 */
export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  manga: ['manga'],
  figures: ['figure', 'figures'],
  tshirts: ['shirt', 'shirts', 'tshirt', 't-shirt', 'tshirts', 't-shirts', 'apparel', 'graphic tshirt', 'graphic tshirts'],
  other: ['other', 'tcg', 'card', 'cards', 'trading card', 'trading cards', 'collectible', 'collectibles'],
};

/** True when the term asks for an entire category rather than a specific product. */
export function matchedCategorySynonym(search: string): string | null {
  const term = search.toLowerCase().trim();
  for (const [category, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.includes(term)) return category;
  }
  return null;
}

/**
 * PostgREST parses `or=(...)` as a comma-separated list, so an unquoted search term
 * containing a comma or parenthesis would be read as extra filters. Wrapping the value
 * in double quotes (with `"` doubled) keeps it a literal.
 */
function quote(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Builds the PostgREST `or` filter for a storefront search.
 *
 * @param scopeKey key into SEARCH_SCOPES — the category page doing the searching
 * @param widenToCategory when true, a category synonym also matches the whole category.
 *   Category pages are already filtered to one category, so this only matters for /products.
 */
export function buildSearchFilter(search: string, scopeKey: string, widenToCategory = false): string {
  const scope = SEARCH_SCOPES[scopeKey] ?? SEARCH_SCOPES.all;
  const escaped = search.replace(/[%_]/g, '\\$&');

  const clauses = [
    ...scope.textFields.map(field => `${field}.ilike.${quote(`%${escaped}%`)}`),
    ...scope.arrayFields.map(field => `${field}.cs.${quote(`{${search}}`)}`),
  ];

  if (widenToCategory) {
    const category = matchedCategorySynonym(search);
    if (category) clauses.push(`category.eq.${category}`);
  }

  return clauses.join(',');
}

/** Shape the in-memory matcher needs. Extra fields are ignored. */
export interface SearchableProduct {
  name?: string | null;
  description?: string | null;
  author?: string | null;
  brand?: string | null;
  series?: string | null;
  tags?: string[] | null;
  character_names?: string[] | null;
  category?: string | null;
}

/**
 * In-memory equivalent of {@link buildSearchFilter}, for admin tooling that already
 * holds the product list. Mirrors Postgres semantics: `ilike` is a case-insensitive
 * substring match, array `contains` is an exact case-sensitive element match.
 */
export function productMatchesSearch(
  product: SearchableProduct,
  search: string,
  scopeKey: string,
  widenToCategory = false
): boolean {
  const scope = SEARCH_SCOPES[scopeKey] ?? SEARCH_SCOPES.all;
  const term = search.toLowerCase().trim();
  if (!term) return false;

  for (const field of scope.textFields) {
    const value = product[field as keyof SearchableProduct];
    if (typeof value === 'string' && value.toLowerCase().includes(term)) return true;
  }

  for (const field of scope.arrayFields) {
    const value = product[field as keyof SearchableProduct];
    if (Array.isArray(value) && value.includes(search)) return true;
  }

  if (widenToCategory) {
    const category = matchedCategorySynonym(search);
    if (category && product.category === category) return true;
  }

  return false;
}
