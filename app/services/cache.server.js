import { isAfter } from 'date-fns';
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

const __dirname = resolve();

const setCache = async (value) => {
  try {
    const cache = await getCache();
    const latest = new Date(cache[0]?.date || '2021-01-01');

    if (value.length === 0) {
      return false;
    }

    const data = value.reduce(
      (prev, item) => {
        const date = item.properties.Date.date.start;
        if (isAfter(new Date(date), latest)) {
          return [
            ...prev,
            {
              id: item.id,
              title: item.properties.Name.title[0]?.plain_text,
              tags: item.properties.Tags.multi_select,
              date,
              summary: item.properties.Summary.rich_text[0]?.plain_text,
              icon: item.icon?.emoji,
            },
          ];
        }
        return prev;
      },
      [...cache]
    );

    writeFileSync(
      resolve(__dirname, 'app/cache/notion.json'),
      JSON.stringify(data)
    );

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const getCache = async () => {
  try {
    const file = readFileSync(resolve(__dirname, 'app/cache/notion.json'));
    const data = JSON.parse(Buffer.from(file).toString());
    console.log('cached: ', data.length);
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export { setCache, getCache };
