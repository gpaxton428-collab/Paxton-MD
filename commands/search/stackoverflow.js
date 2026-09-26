import { createLookupCommand } from '../../lib/helpers/lookupCommand.js';

export default createLookupCommand({
  name: 'stackoverflow', kind: 'stackoverflow', alias: ['sosearch'], label: 'Stack Overflow questions', example: 'python asyncio',
  titleKeys: ['title'], detailKeys: ['tags']
});
