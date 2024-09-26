import exifParser from "exif-parser";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto"
import {fileURLToPath} from "url"
const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

const srcFolder = path.join(__dirname, '..', 'assets');

function computeCompassAngle(lat1, lon1, lat2, lon2) {
	const dLon = (lon2 - lon1) * Math.PI / 180;  // Longitude különbség radiánban
	const lat1Rad = lat1 * Math.PI / 180;  // Az első kép szélességi fokának átváltása radiánba
	const lat2Rad = lat2 * Math.PI / 180;  // A második kép szélességi fokának átváltása radiánba

	// Azimut kiszámítása
	const y = Math.sin(dLon) * Math.cos(lat2Rad);
	const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
		Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
	const angle = Math.atan2(y, x) * 180 / Math.PI;

	// Azimut normalizálása 0 és 360 fok közé
	const compassAngle = (angle + 360) % 360;
	return compassAngle;
}
export const readImagesAndExtractExif = async () => {
	try {
		// Read all files in the src folder
		const files = fs.readdirSync(srcFolder);

		const cameraType = "spherical"
		const imageMetadataArray = [];
		const thumbUrl = `${cameraType}`;
		const sequenceId = `sequence|${cameraType}`;


		let idCounter = 0;
		let lastCompassAngle = 0;
		const sequence = {id: sequenceId, image_ids: []};
		for (let i = 0;  i < files.length;i++) {
			const file = files[i]
			let file2 = null;
			if(i <files.length-1){
				file2 = files[i+1]
			}
			const filePath = path.join(srcFolder, file);
			const idHash = crypto.createHash('sha1')
			idHash.update(file);
			const id = file.split(".")[0]

			const imageId = `image|${id}|${cameraType}`;
			const thumbId = `thumb|${cameraType}|${id}`;
			const meshId = `mesh|${cameraType}|${id}`;
			// Check if the file is an image (optional, can be improved with regex)
			if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
				const imageBuffer = fs.readFileSync(filePath);


				// Parse EXIF data from the image
				const parser = exifParser.create(imageBuffer);
				const exifData = parser.parse();


				// Extract necessary data

				const computedAlt = exifData.tags.GPSAltitude || 0;
				let compassAngle = lastCompassAngle;
				const width = exifData.imageSize.width;
				const height = exifData.imageSize.height;
				sequence.image_ids.push(imageId);

				const computedGeometry = {lat: exifData.tags.GPSLatitude, lng: exifData.tags.GPSLongitude};
				if(file2){
					console.log(file2)
					const filePath2 = path.join(srcFolder, file2);

					const imageBuffer2 = fs.readFileSync(filePath2);
					// Parse EXIF data from the image
					const parser2 = exifParser.create(imageBuffer2);
					const exifData2 = parser2.parse();

					compassAngle = computeCompassAngle(exifData.tags.GPSLatitude, exifData.tags.GPSLongitude, exifData2.tags.GPSLatitude, exifData2.tags.GPSLongitude)
					lastCompassAngle = compassAngle
				}
				// Dummy data for undefined fields
				const cameraParameters = [];

				// Construct the image metadata object
				const imageMetadata = {
					altitude: computedAlt,
					atomic_scale: 1,
					camera_parameters: cameraParameters,
					camera_type: cameraType,
					compass_angle: compassAngle,
					computed_compass_angle: compassAngle,
					computed_altitude: computedAlt,
					computed_geometry: computedGeometry,
					creator: { id: null, username: null },
					geometry: computedGeometry,
					height,
					id: imageId,
					merge_id: 'merge_id',
					mesh: { id: meshId, url: meshId },
					exif_orientation: 1,
					private: null,
					quality_score: 1,
					sequence: { id: sequenceId },
					thumb: { id: thumbId, url: "http://localhost:4000/image/" + file },
					width,
				};

				imageMetadataArray.push(imageMetadata);
			}
		}
		sequence.image_ids = sequence.image_ids.reverse()
		// Log or process the image metadata array
		return {images: imageMetadataArray, sequences: [sequence]}
	} catch (err) {
		console.error('Error reading images or extracting EXIF data:', err);
	}
};

