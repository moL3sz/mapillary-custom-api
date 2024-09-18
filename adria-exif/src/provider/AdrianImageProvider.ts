
import {DataProviderBase, ImagesContract, S2GeometryProvider} from "mapillary-js";
import {generateCells} from "../utils/provider.ts";




export const DEFAULT_REFERENCE = {alt: 0, lat: 0, lng: 0};
export const DEFAULT_INTERVALS = 10;


export class ProceduralDataProvider extends DataProviderBase {
	private reference: any;

	private idCounter: any;
	private _intervals: any;

	private clusters: any;
	private cells: any;
	private images: any;
	private meshes: any;
	private sequences: any;
	constructor(options) {
		super(options.geometry ?? new S2GeometryProvider());

		this.idCounter = options.idCounter ?? 0;
		this._intervals = options._intervals ?? DEFAULT_INTERVALS;
		this.reference = options.reference ?? DEFAULT_REFERENCE;


		this._initialize();
		this._populate();
	}

	getCluster(url) {
		return Promise.resolve({points: {}, reference: {}});
	}

	getCoreImages(cellId) {
		const images = this.cells.has(cellId) ? this.cells.get(cellId) : [];
		return Promise.resolve({cell_id: cellId, images});
	}

	getImages(imageIds) {

		const images = imageIds.map((id) => ({
			node: this.images.has(id) ? this.images.get(id) : null,
			node_id: id,
		}));
		return Promise.resolve(images);
	}

	async getImageBuffer(url) {

		const res = await fetch(url)
		const data = await res.blob()
		return data.arrayBuffer()
	}

	getMesh(url) {
		const mesh = this.meshes.has(url)
			? this.meshes.get(url)
			: {faces: [], vertices: []};
		return Promise.resolve(mesh);
	}

	getSequence(sequenceId) {
		return new Promise((resolve, reject) => {
			if (this.sequences.has(sequenceId)) {
				resolve(this.sequences.get(sequenceId));
			} else {
				reject(new Error(`Sequence ${sequenceId} does not exist`));
			}
		});
	}

	getSpatialImages(imageIds) {
		return this.getImages(imageIds);
	}



	_initialize() {
		this.sequences = new Map();
		this.images = new Map();
		this.clusters = new Map();
		this.cells = new Map();
		this.meshes = new Map();
	}

	_populate() {

		(async ()=>{
			const res = await fetch("http://localhost:4000/images", {method: "GET"});
			const result = await res.json();
			const {images, sequences} = result;
			console.log(result)

			this.sequences = new Map(sequences.map((s) => [s.id, s]));
			this.images = new Map(images.map((i) => [i.id, i]));
			this.cells = generateCells(this.images.values(), this._geometry);
		})();
		return

	}
}