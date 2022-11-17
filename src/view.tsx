import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { SearchView } from "./component/SearchView";
import { createRoot } from "react-dom/client";
import DanpungPlugin from "./main";

const VIEW_TYPE_EXTERNAL_LINK_VIEWER = "external-link-viewer";

class ExternalLinkViewer extends ItemView {
	constructor(leaf: WorkspaceLeaf, public plugin: DanpungPlugin) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXTERNAL_LINK_VIEWER;
	}

	getDisplayText() {
		return "External Link Viewer";
	}

	async onOpen() {
		const root = createRoot(this.containerEl.children[1]);
		root.render(
			<React.StrictMode>
				<SearchView data={this.plugin.linkIndexer.linkStore} />
			</React.StrictMode>
		);
	}

	async onClose() {
		ReactDOM.unmountComponentAtNode(this.containerEl);
	}
}

export {
	VIEW_TYPE_EXTERNAL_LINK_VIEWER,
	ExternalLinkViewer
}
