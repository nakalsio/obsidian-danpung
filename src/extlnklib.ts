import { Plugin, TFile } from "obsidian";
import DanpungPlugin from "./main";

export {
	LinkIndexer, Link, LinkType, getLinks
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
					this.updateStore(file.path, getLinks(content, file.path, mode));
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
					this.updateStore(oldPath, getLinks(content, file.path, mode));
				})
			} )
		)
		plugin.registerEvent(
			plugin.app.vault.on('delete', (file) => {
				console.log('File deleted: ' + file.path);
				this.updateStore(file.path, []);
			} )
		)
		plugin.registerEvent(
			plugin.app.metadataCache.on('changed', (file, data, cache) => {
				this.updateTags(file.path, cache.tags?.map((tag) => tag.tag) ?? []);
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

const fullLinkOnlyRegex = /^\[([\w\s\d]+)\]\((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))\)$/

const fullAndRelative = /\[([^\[]+)\]\((.*)\)/

const regexMdLinks = /\[([^\[]+)\](\(.*\))/gm

const getLinks = (content: string, filepath: string, mode: LinkType = LinkType.FQL): Link[] => {

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
