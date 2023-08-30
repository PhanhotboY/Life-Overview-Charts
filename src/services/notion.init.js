const { Client } = require('@notionhq/client');

class Notion extends Client {
  client;

  static getClient() {
    if (!this.client) {
      this.client = new Client({
        auth: process.env.NOTION_INTEGRATION_TOKEN,
        logLevel: 'debug',
      });
    }

    return this.client;
  }
}

module.exports.client = Notion.getClient();
