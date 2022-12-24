import RssParser from 'rss-parser';
import fs from 'fs';

const testDataDir = 'test/rssdata';

test('parses feed test data', () => {
  const parser = new RssParser();
  const testFeedFilenames = fs.readdirSync(testDataDir);
  
  for (let filename of testFeedFilenames) {
    const fileContents = fs.readFileSync(`${testDataDir}/${filename}`, 'utf-8');
    const parsedFeed = parser.parseString(fileContents);
  }
});
