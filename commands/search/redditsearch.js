import { createLookupCommand } from '../../lib/helpers/lookupCommand.js';

export default createLookupCommand({
  name: 'redditsearch', kind: 'reddit', alias: ['reddit'], label: 'Reddit posts', example: 'funny',
  titleKeys: ['title'], detailKeys: ['subreddit', 'author']
});
