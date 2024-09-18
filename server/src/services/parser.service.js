import exifParser from "exif-parser";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto"
import {fileURLToPath} from "url"
const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

const srcFolder = path.join(__dirname, '..', 'assets');
export const readImagesAndExtractExif = async () => {
	try {
		// Read all files in the src folder
		const files = fs.readdirSync(srcFolder);

		const cameraType = "spherical"
		const imageMetadataArray = [];
		const thumbUrl = `${cameraType}`;
		const sequenceId = `sequence|${cameraType}`;
		let idCounter = 0;
		const sequence = {id: sequenceId, image_ids: []};
		for (const file of files) {
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
				const compassAngle = 0;
				const width = exifData.imageSize.width;
				const height = exifData.imageSize.height;
				sequence.image_ids.push(imageId);
				const rotation = [Math.PI / 2, Math.PI, 0.4];

				const computedGeometry = {lat: exifData.tags.GPSLatitude, lng: exifData.tags.GPSLongitude};

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
					computed_rotation: rotation,

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

