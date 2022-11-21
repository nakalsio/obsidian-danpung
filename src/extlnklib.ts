import { Plugin, TFile } from "obsidian";
import DanpungPlugin from "./main";
import { parse } from 'node-html-parser';

export {
	LinkIndexer, Link, LinkType, scanMarkdownLinks, scanHtmlLinks, scanOrphanedLinks
}

enum LinkType {
	FQL = 'FQL',
	FQLRelative = 'FQLRelative',
	Unknown = 'Unknown'
}

class Link {
	constructor(
		public Text: string,
		public Path: string,
		public FilePath: string,
		public Tags: string[] = []) { }
}

class LinkIndexer {

	constructor(
		public plugin: DanpungPlugin,
		public linkStore: Link[] = []) {
		plugin.registerEvent(
			plugin.app.vault.on('modify', (file) => {
				// Read the file and update the link indices
				plugin.app.vault.cachedRead(file as TFile).then((content) => {
					let mode = LinkType.FQL;
					if (!plugin.settings.onlyFullLink) {
						mode = LinkType.FQLRelative;
					}
					const scanedLinks = scanMarkdownLinks(content, file.path, mode);
					scanedLinks.push(...scanHtmlLinks(content, file.path, mode));
					scanedLinks.push(...scanOrphanedLinks(content, file.path));

					this.updateStore(file.path, scanedLinks);
				})
			})
		)
		plugin.registerEvent(
			plugin.app.vault.on('rename', (file, oldPath) => {
				plugin.app.vault.cachedRead(file as TFile).then((content) => {
					let mode = LinkType.FQL;
					if (!plugin.settings.onlyFullLink) {
						mode = LinkType.FQLRelative;
					}
					const scanedLinks = scanMarkdownLinks(content, file.path, mode);
					scanedLinks.push(...scanHtmlLinks(content, file.path, mode));
					scanedLinks.push(...scanOrphanedLinks(content, file.path));

					this.updateStore(oldPath, scanedLinks);
				})
			})
		)
		plugin.registerEvent(
			plugin.app.vault.on('delete', (file) => {
				console.log('File deleted: ' + file.path);
				this.updateStore(file.path, []);
			})
		)
		plugin.registerEvent(
			plugin.app.metadataCache.on('changed', (file, data, cache) => {
				const updatedTags = cache.tags?.map((tag) => tag.tag) ?? [];
				updatedTags.push(...(cache.frontmatter?.tags ?? []));
				this.updateTags(file.path, updatedTags);
			}
			))
	}

	updateStore = (filepath: string, links: Link[]) => {
		this.linkStore = this.linkStore.filter((link) => link.FilePath !== filepath)
		this.linkStore.push(...links);

		// Update settings.linkStore
		this.plugin.settings.linkStore = this.linkStore;
		// Update status bar
		this.plugin.statusBarItemEl?.setText(`External Links: ${this.linkStore.length}`);
	}

	updateTags = (filepath: string, tags: string[]) => {
		this.linkStore.map((link) => {
			if (link.FilePath === filepath) {
				link.Tags = tags;
			}
			return link;
		})

		// Update settings.linkStore
		this.plugin.settings.linkStore = this.linkStore;
	}
}

const regexMdLinks =  /\[([^\[]+)\](\(.*\))/gm

const fullLinkOnlyRegex = /^\[([\w\s\d]+)\]\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))\)$/

const fullAndRelative = /\[([^\[]+)\]\((.*)\)/

const scanMarkdownLinks = (content: string, filepath: string, mode: LinkType = LinkType.FQL): Link[] => {

	const links: Link[] = [];

	const mdLinks = content.matchAll(regexMdLinks);

	let pattern = fullLinkOnlyRegex;
	if (mode != LinkType.FQL) {
		pattern = fullAndRelative;
	}

	for (const mdLink of mdLinks) {
		const linkExpr = mdLink[0];
		var matched = linkExpr.match(pattern);
		if (matched)
			links.push(new Link(matched[1], matched[2], filepath));
	}

	return links;
}

const fullHtmlLinkRegex = /<a href=["'](https?:\/\/.*)["']>(.*)<\/a>/gm

const htmlLinkRegex = /<a href=["'](.*)["']>(.*)<\/a>/gm

const scanHtmlLinks = (content: string, filepath: string, mode: LinkType = LinkType.FQL): Link[] => {
	const links: Link[] = [];

	let pattern = fullHtmlLinkRegex;
	if (mode != LinkType.FQL) {
		pattern = htmlLinkRegex;
	}

	const htmlLinks = content.matchAll(pattern);

	for (const htmlLink of htmlLinks) {
		links.push(new Link(htmlLink[2], htmlLink[1], filepath));
	}

	return links;
}

const fullOrphanedLinkRegex = /(?<![\("'<])(https?:\/\/[^\s\)]+)(?![\)"'>])/gm

const fullAngleBracketOrphanedLinkRegex = /(?<![\("'])<(https?:\/\/[^\s\)]+)>(?![\)"'])/gm

const scanOrphanedLinks = (content: string, filepath: string): Link[] => {
	const links: Link[] = [];

	let orphanedLinks = content.matchAll(fullOrphanedLinkRegex);

	for (const orphanedLink of orphanedLinks) {
		links.push(new Link(orphanedLink[1], orphanedLink[1], filepath));
	}

	orphanedLinks = content.matchAll(fullAngleBracketOrphanedLinkRegex);

	for (const orphanedLink of orphanedLinks) {
		links.push(new Link(orphanedLink[1], orphanedLink[1], filepath));
	}

	return links;
}

