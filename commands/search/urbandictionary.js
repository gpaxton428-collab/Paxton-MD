import { createLookupCommand } from '../../lib/helpers/lookupCommand.js';

export default createLookupCommand({
  name: 'urbandictionary', kind: 'urbandictionary', alias: ['urban', 'ud'], label: 'Urban Dictionary', example: 'rizz',
  titleKeys: ['word'], detailKeys: ['definition']
});
