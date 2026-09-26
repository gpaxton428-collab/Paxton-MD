import { createLookupCommand } from '../../lib/helpers/lookupCommand.js';

export default createLookupCommand({
  name: 'githubsearch', kind: 'github', alias: ['ghsearch'], label: 'GitHub repositories', example: 'whiskeysockets baileys',
  titleKeys: ['full_name', 'name'], detailKeys: ['description']
});
