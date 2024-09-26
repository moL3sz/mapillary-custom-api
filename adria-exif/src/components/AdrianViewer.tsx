import {useEffect, useRef} from "react";
import {
	CameraControls,
	CameraVisualizationMode,
	ComponentSize,
	OriginalPositionMode,
	PointVisualizationMode,
	Viewer,
} from "mapillary-js";
import {ProceduralDataProvider} from "../provider/AdrianImageProvider.ts";
import {useAppDispatch} from "../store/hooks.ts";
import {setCoordinates, setViewAngle} from "../store/map/map.store.ts";

export const AdrianViewer = () => {

	const contRef = useRef<HTMLDivElement | null>(null);
	const dispatch = useAppDispatch();

	useEffect(() => {
		const dataProvider = new ProceduralDataProvider({});
		const options = {
			dataProvider,
			cameraControls: CameraControls.Street,
			component: {
				cover: false,
				image: true,
				bearing: {
					size: ComponentSize.Automatic,
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
		} as any;
		const viewer = new Viewer(options)
		setTimeout(() => {
			viewer.moveTo("image|GSAA0008|spherical")
				.then(node => {
					dispatch(setCoordinates({...node.computedLngLat}));

				})
				.catch((error) => console.error(error));

			//viewer.moveTo("image|perspective|0").catch((error) => console.error(error));

		}, 1000)
		viewer.on("image", (e) => {
			dispatch(setCoordinates({...e.image.computedLngLat}));
		})
		const onFov = async () => {
			const viewerContainer = viewer.getContainer();
			const height = viewerContainer.offsetHeight;
			const width = viewerContainer.offsetWidth;
			const aspect = height === 0 ? 0 : width / height;

			const fov =  (await viewer.getPointOfView());
			const angle = fov.bearing;
			dispatch(setViewAngle(angle))

		};
		viewer.on("pov", onFov)


		return () => {
			viewer.remove()
		}
	}, []);

	return (
		<div className={"viewer"} ref={contRef}></div>
	)


}