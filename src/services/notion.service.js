const { client } = require('./notion.init');

module.exports = class NotionService {
  static getItems() {
    return client.databases.query({ database_id: '9c73fdaaa5a2414aaeadb01fab4c054f' });
  }
};
