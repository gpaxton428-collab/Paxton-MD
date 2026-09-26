import { createLookupCommand } from '../../lib/helpers/lookupCommand.js';

export default createLookupCommand({
  name: 'pypisearch', kind: 'pypi', alias: [], label: 'PyPI packages', example: 'requests',
  titleKeys: ['name'], detailKeys: ['summary', 'version']
});
