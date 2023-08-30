const NotionService = require('../services/notion.service');

const startingTime = new Date().setHours(0, 0, 0, 0);
let dbs = NotionService.getItems();

module.exports = class DashboardController {
  static async getItems(req, res) {
    if (startingTime < new Date().setHours(0, 0, 0, 0)) dbs = NotionService.getItems();

    const minimal = (await dbs).results.reduce((result, page) => {
      if (page.properties.Name.title[0].plain_text !== 'Morning')
        result.push({
          tags: page.properties.Tags.multi_select,
          date: page.properties.Date.date.start,
          summary: page.properties.Summary.rich_text[0]?.plain_text,
          icon: page.icon.emoji,
        });

      return result;
    }, []);

    res.render('index', { dbs: JSON.stringify(minimal) });
  }
};
