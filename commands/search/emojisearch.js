import { createLookupCommand } from '../../lib/helpers/lookupCommand.js';

export default createLookupCommand({
  name: 'emojisearch', kind: 'emoji', alias: ['emoji'], label: 'emoji', example: 'heart',
  titleKeys: ['name', 'emoji'], detailKeys: ['character']
});
