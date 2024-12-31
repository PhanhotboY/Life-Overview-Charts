import { client } from './notion.init.server';

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
    let items = [];
    let next_cursor = undefined;
    let has_more = true;

    while (has_more) {
      console.log('fetching items', next_cursor);
      const res = await this.fetchDatabase({
        date: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        start_cursor: next_cursor,
      });

      items = [
        ...items,
        ...res.results.map((item) => ({
          id: item.id,
          title: item.properties.Name.title[0]?.plain_text,
          tags: item.properties.Tags.multi_select,
          date: item.properties.Date.date.start,
          summary: item.properties.Summary.rich_text[0]?.plain_text,
          icon: item.icon?.emoji,
        })),
      ];
      next_cursor = res.next_cursor;
      has_more = res.has_more;
    }

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return items;
  }
}
