import React, {FC, useEffect, useRef, useState} from "react";

// ✅ Types are available here
import {MapContainer, Marker, Polygon, Popup, TileLayer} from 'react-leaflet'
import {useAppSelector} from "../store/hooks.ts";
import {LngLat} from "mapillary-js";

interface CircleSliceProps {
	center: LngLat
	radius: number;
	heading: number;
	arcAngle: number;
}

const CircleSlice: React.FC<CircleSliceProps> = ({ center, radius, heading, arcAngle }) => {
	// Helper function to convert degree to radian
	const toRad = (degree: number): number => (degree * Math.PI) / 180;

	// Function to generate the coordinates of the sector
	const generateSector = (
		center: LngLat,
		radius: number,
		heading: number,
		arcAngle: number
	): LngLat[] => {
		const points: typeof center[] = [center];
		const numPoints = 30; // Number of points to make the arc smooth
		const startAngle = heading - arcAngle / 2;
		const endAngle = heading + arcAngle / 2;

		for (let i = 0; i <= numPoints; i++) {
			const angle = toRad(startAngle + (i * (endAngle - startAngle)) / numPoints);
			const lat = center.lat + (radius / 111300) * Math.cos(angle); // Approx conversion for latitude
			const lng = center.lng + (radius / 111300) * Math.sin(angle); // Approx conversion for longitude
			points.push({lat,lng});
		}
		points.push(center); // Close the sector by connecting to the center
		return points;
	};

	const sectorCoords = generateSector(center, radius, heading, arcAngle);

	return <Polygon positions={sectorCoords} color="blue" />;
};
export const AdrianMap: FC = ()=>{

	const pos = useAppSelector(state => state.map.coordinates);
	const angle = useAppSelector(state => state.map.angle);
	const [map, setMap] = useState<any>(null)
	useEffect(() => {
		console.log(pos)
		map?.setView(pos, 20);
	}, [pos,map]);
	return (

			<MapContainer ref={setMap as any}  center={pos}  zoom={5}  scrollWheelZoom={false}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={pos}>
					<Popup>
						A pretty CSS3 popup. <br /> Easily customizable.
					</Popup>
				</Marker>
				<CircleSlice center={pos} heading={angle} radius={100} arcAngle={90}/>
			</MapContainer>
	);
}