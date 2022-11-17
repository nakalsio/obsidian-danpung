import * as React from "react";

import { DebounceInput } from 'react-debounce-input';
import { Link } from "../extlnklib";
import { search } from '../fuzzy';
import { v4 as uuidv4 } from 'uuid';

type SearchViewProps = {
	data: Link[];
}

export const SearchView = ({ data }: SearchViewProps) => {

	const [searchQuery, setSearchQuery] = React.useState('');

	const [result, setResult] = React.useState<Link[]>([]);

	const handleQuery = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const query = evt.target.value;
		setResult(search(data, query));
	}

	const handleFilePath = (evt: React.MouseEvent<HTMLElement>) => {
		console.log(evt.currentTarget.innerText);
	}

	const handleTag = (evt: React.MouseEvent<HTMLElement>) => {
		const query = evt.currentTarget.innerText;
		setSearchQuery(query);
		setResult(search(data, query));
	}

	return (
		<div>
			<div>Search your external links</div>
			<div>
				<DebounceInput
					className="ext_link_viewer_search"
					minLength={2}
					debounceTimeout={300}
					onChange={handleQuery}
					value={searchQuery}
				 />
			</div>
			<div>
				<small className="ext_link_viewer_result_comment">{result.length} found</small>
			</div>
			<ul className="ext_link_viewer_results">
				{result.map((link) => {
					return (
						<li key={uuidv4()} className="ext_link_viewer_item">
							<div className="ext_link_viewer_item_title">{link.Text}</div>
							<div className="ext_link_viewer_item_link">
								<small>
									<a href={link.Path}>{link.Path}</a>
								</small>
							</div>
							<div onClick={handleFilePath} className="ext_link_viewer_item_filepath">{link.FilePath}</div>
							<div className="ext_link_viewer_item_tags">{
								link.Tags.map((tag) => {
									return (
										<span onClick={handleTag} key={uuidv4()} className="ext_link_viewer_item_tag">{tag}</span>
									)
								})
							}</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
