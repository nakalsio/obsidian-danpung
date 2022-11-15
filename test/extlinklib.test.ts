import {describe, expect, test} from '@jest/globals';
import {Link, getLinks} from '../src/extlnklib';

test('should parse markdown links', () => {
	  // Example md file contents
	  const mdContents = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit..

[hello link](/admin/table_edit/table_edit.cfm?action=edit&table_name=organizationsXcategories)

Lorem ipsum dolor sit amet, consectetur adipiscing elit..

[otherLink](https://google.com)

Lorem ipsum dolor sit amet, consectetur adipiscing elit..

[third link](https://google.com)
`

	  const links = getLinks(mdContents);

	//   expect(links.length).toBe(3);
	//   expect(links[0].Text).toBe('hello link');
	//   expect(links[0].Path).toBe('/admin/table_edit/table_edit.cfm?action=edit&table_name=organizationsXcategories');
	//   expect(links[1].Text).toBe('otherLink');
	//   expect(links[1].Path).toBe('https://google.com');
	//   expect(links[2].Text).toBe('third link');
	//   expect(links[2].Path).toBe('https://google.com');

	expect(links[0].Text).toBe('otherLink');
	expect(links[0].Path).toBe('https://google.com');
	expect(links[1].Text).toBe('third link');
	expect(links[1].Path).toBe('https://google.com');

});
