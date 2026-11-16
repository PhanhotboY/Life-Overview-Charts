import { client } from './notion.init.server';

const ITEMS_CACHE_TTL = 5 * 60 * 1000;
const MAX_ITEMS_CACHE_ENTRIES = 100;
const itemsCache = new Map();

export default class NotionService {
  static async fetchDatabase(options) {
    return await client.databases.query({
      database_id: '9c73fdaaa5a2414aaeadb01fab4c054f',
      page_size: 100,
      sorts: [
        {
          property: 'Date',
          direction: 'ascending',
        },
      ],
      filter: {
        and: [
          {
            property: 'Date',
            date: {
              on_or_after: options.date.from,
            },
          },
          {
            property: 'Date',
            date: {
              on_or_before: options.date.to,
            },
          },
          {
            property: 'Tags',
            multi_select: {
              is_not_empty: true,
            },
          },
        ],
      },
      ...options,
    });
  }

  static async getItems({ date: { from, to } }) {
    const cacheKey = `${from.toISOString()}:${to.toISOString()}`;
    const cached = itemsCache.get(cacheKey);

    if (cached && (!cached.expiresAt || cached.expiresAt > Date.now())) {
      itemsCache.delete(cacheKey);
      itemsCache.set(cacheKey, cached);
      return cached.promise;
    }

    itemsCache.delete(cacheKey);
    const entry = { expiresAt: 0 };
    entry.promise = this.fetchItems(from, to);
    itemsCache.set(cacheKey, entry);

    try {
      const items = await entry.promise;
      entry.expiresAt = Date.now() + ITEMS_CACHE_TTL;

      while (itemsCache.size > MAX_ITEMS_CACHE_ENTRIES) {
        itemsCache.delete(itemsCache.keys().next().value);
      }

      return items;
    } catch (error) {
      if (itemsCache.get(cacheKey) === entry) itemsCache.delete(cacheKey);
      throw error;
    }
  }

  static async fetchItems(from, to) {
    let items = [];
    let next_cursor = undefined;
    let has_more = true;
    const cursors = new Set();

    while (has_more) {
      const res = await this.fetchDatabase({
        date: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        start_cursor: next_cursor,
      });

      items.push(
        ...res.results.map((item) => ({
          id: item.id,
          title: item.properties.Name.title[0]?.plain_text,
          tags: item.properties.Tags.multi_select,
          date: item.properties.Date.date.start,
          summary: item.properties.Summary.rich_text[0]?.plain_text,
          icon: item.icon?.emoji,
        }))
      );
      next_cursor = res.next_cursor;
      has_more = res.has_more;

      if (has_more && (!next_cursor || cursors.has(next_cursor))) {
        throw new Error('Notion pagination returned an invalid cursor');
      }
      if (next_cursor) cursors.add(next_cursor);
    }

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items;
  }
}
