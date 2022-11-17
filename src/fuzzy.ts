import Fuse from 'fuse.js'
import { Link } from "./extlnklib";

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

const options = {
	includeScore: true,
	keys: ['Text']
}

const search = (data: Link[], query: string, keys: string[]) => {
	options.keys = keys;
	const fuse = new Fuse(data, options);
	const fuseResults = fuse.search(query);
	return fuseResults.sort(compareFn).map((result) => result.item);
}

export {
	compareFn,
	search
}
