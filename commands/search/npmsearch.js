import { createLookupCommand } from '../../lib/helpers/lookupCommand.js';

export default createLookupCommand({
  name: 'npmsearch', kind: 'npm', alias: [], label: 'npm packages', example: 'express',
  titleKeys: ['name'], detailKeys: ['description', 'version']
});
