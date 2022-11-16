import { SuggestModal, Notice, MarkdownView } from "obsidian";
import { Link } from "./extlnklib";
import DanpungPlugin from "./main";
import Fuse from 'fuse.js'

const defaultSort = (a: Link, b: Link) => {
	return a.Text.localeCompare(b.Text);
}

const compareFn = (a: Fuse.FuseResult<Link>, b: Fuse.FuseResult<Link>) => {
	const aScore = a.score ?? -1;
	const bScore = b.score ?? -1;

	if (aScore < bScore) {
		return -1;
	}
	if (aScore > bScore) {
		return 1;
	}
	return 0;
}

export class LinkSuggestionModal extends SuggestModal<Link> {
	options = {};

	getSuggestions(query: string): Link[] | Promise<Link[]> {
		if (query == '') {
			return this.plugin.linkIndexer.linkStore.sort(defaultSort);
		}
		const fuse = new Fuse(this.plugin.linkIndexer.linkStore, this.options);
		const fuseResults = fuse.search(query);
		const searchResult = fuseResults.sort(compareFn).map((result) => result.item );
		return searchResult;

		// return this.plugin.linkIndexer.linkStore.filter((link) =>
		// 	link.Text.toLowerCase().includes(query.toLowerCase()) ||
		// 	link.Path.toLowerCase().includes(query.toLowerCase()) ||
		// 	link.FilePath.toLowerCase().includes(query.toLowerCase())
		// );
	}
	renderSuggestion(value: Link, el: HTMLElement) {
		const titleEl = el.createEl("div");
		titleEl.createEl("span", { text: value.Text, cls: 'link_suggestion_title' });
		titleEl.createEl("span", { text: `  (${value.FilePath})`, cls: 'link_suggestion_filepath'});
		// el.createEl("div", { text: `${value.Text} (${value.FilePath})` });
		el.createEl("div").createEl("small", { text: value.Path, cls: 'link_suggestion_url' });
		const tagsDiv = el.createEl("div");
		value.Tags.forEach((tag) => {
			tagsDiv.createEl("span", { text: tag, cls: 'link_suggestion_tag'})
		})
	}
	onChooseSuggestion(item: Link, evt: MouseEvent | KeyboardEvent) {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			view.editor.replaceSelection(`[${item.Text}](${item.Path})`);
		}
	}
	constructor(public plugin: DanpungPlugin) {

		super(plugin.app);
		this.options = {
			includeScore: true,
			keys: ['Text', 'Path', 'Tags']
		}
	}
}
