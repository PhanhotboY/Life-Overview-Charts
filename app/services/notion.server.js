import { client } from './notion.init.server';

export default class NotionService {
  static async getItems(options) {
    return await client.databases.query({
      database_id: '9c73fdaaa5a2414aaeadb01fab4c054f',
      page_size: 100,
      sorts: [
        {
          property: 'Date',
          direction: 'ascending',
        },
      ],
      ...options,
    });
  }
}
