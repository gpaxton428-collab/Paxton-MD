import { createLookupCommand } from '../../lib/helpers/lookupCommand.js';

export default createLookupCommand({
  name: 'newssearch', kind: 'news', alias: ['news'], label: 'news articles', example: 'climate change',
  titleKeys: ['title', 'headline'], detailKeys: ['source', 'publishedAt', 'date']
});
