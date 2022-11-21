import { describe, expect, test } from '@jest/globals';
import { Link, scanMarkdownLinks, LinkType, scanHtmlLinks, scanOrphanedLinks } from '../src/extlnklib';

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

	let links = scanMarkdownLinks(mdContents, 'test.md');
	expect(links[0].Text).toBe('otherLink');
	expect(links[0].Path).toBe('https://google.com');
	expect(links[1].Text).toBe('third link');
	expect(links[1].Path).toBe('https://google.com');

	links = scanMarkdownLinks(mdContents, 'test.md', LinkType.FQLRelative);
	expect(links.length).toBe(3);
	expect(links[0].Text).toBe('hello link');
	expect(links[0].Path).toBe('/admin/table_edit/table_edit.cfm?action=edit&table_name=organizationsXcategories');
	expect(links[1].Text).toBe('otherLink');
	expect(links[1].Path).toBe('https://google.com');
	expect(links[2].Text).toBe('third link');
	expect(links[2].Path).toBe('https://google.com');

});

test('should parse HTML links', () => {
	const mdContents = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit..

<a href="/admin/table_edit/table_edit.cfm?action=edit&table_name=organizationsXcategories">hello link</a>

Lorem ipsum dolor sit amet, consectetur adipiscing elit..

[otherLink](https://google.com)

<a href="https://google.com">Second link</a>

Lorem ipsum dolor sit amet, consectetur adipiscing elit..

[third link](https://google.com)

<a href="https://google.com">Third link</a>
`

	let links = scanHtmlLinks(mdContents, 'test.md');

	expect(links.length).toBe(2);
	expect(links[0].Text).toBe('Second link');
	expect(links[0].Path).toBe('https://google.com');
	expect(links[1].Text).toBe('Third link');
	expect(links[1].Path).toBe('https://google.com');

	links = scanHtmlLinks(mdContents, 'test.md', LinkType.FQLRelative);

	expect(links.length).toBe(3);

});

test('should parse Orphaned links', () => {

	const mdContents = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit..

<a href="/admin/table_edit/table_edit.cfm?action=edit&table_name=organizationsXcategories">hello link</a>

Lorem ipsum dolor sit amet, consectetur adipiscing elit..

[otherLink](https://google.com)

https://netflix.com

<a href="https://google.com">Second link</a>

Lorem ipsum dolor sit amet, consectetur adipiscing elit..

[third link](https://google.com)

<https://www.apple.com>

<a href="https://google.com">Third link</a>
`

	let links = scanOrphanedLinks(mdContents, 'test.md')
	expect(links.length).toBe(2);
	expect(links[0].Text).toBe("Netflix - Watch TV Shows Online, Watch Movies Online");
	expect(links[0].Path).toBe('https://netflix.com');
	expect(links[1].Text).toBe('Apple');
	expect(links[1].Path).toBe('https://www.apple.com');

});
