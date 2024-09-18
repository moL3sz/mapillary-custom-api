import {useEffect, useRef} from "react";
import {
	CameraControls,
	CameraVisualizationMode,
	ComponentSize,
	OriginalPositionMode,
	PointVisualizationMode,
	Viewer,
	ViewerOptions
} from "mapillary-js";
import {ProceduralDataProvider} from "../provider/AdrianImageProvider.ts";

export const AdrianViewer = () => {

	const contRef = useRef<HTMLDivElement | null>(null);


	useEffect(() => {
		const dataProvider = new ProceduralDataProvider({});
		const options = {
			dataProvider,
			cameraControls: CameraControls.Street,
			component: {
				cover: false,
				image: true,
				bearing: {
					size: ComponentSize.Automatic
				},
				pointer: true,
				tag: {
					createColor: true,
					indicatePointsCompleter: true,
				},

				sequence: true,
				spatial: {
					cameraVisualizationMode: CameraVisualizationMode.Sequence,
					cameraSize: 0.5,
					pointVisualizationMode: PointVisualizationMode.Hidden,
					originalPositionMode: OriginalPositionMode.Flat,


				},
			},
			container: contRef.current!,
			imageTiling: false,
		} as ViewerOptions;
		const viewer = new Viewer(options)
		viewer.on("image", (e) => {
			console.log(e)
		})
		setTimeout(() => {
			viewer.moveTo("image|GSAA0008|spherical").catch((error) => console.error(error));
			//viewer.moveTo("image|perspective|0").catch((error) => console.error(error));

		}, 1000)

		return () => {
			viewer.remove()
		}
	}, []);

	return (
		<div className={"viewer"} ref={contRef}></div>
	)


}