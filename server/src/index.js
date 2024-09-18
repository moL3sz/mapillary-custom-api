

import express from "express"
import cors from "cors"
import {readImagesAndExtractExif} from "./services/parser.service.js"
import {fileURLToPath} from "url";
import path from "path";

const PORT = 4000;
const app = express();

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename)

const assets = path.join(__dirname, 'assets');

app.use(cors("*"))


app.get("/image/:fileName", (req, res)=>{
	const p = path.join(assets, req.params.fileName);
	console.log(p)
	res.sendFile(p);

})
app.get("/images", async (req, res)=>{
	const result = await readImagesAndExtractExif();
	res.send(result)
})

app.listen(PORT, ()=>{
	console.log("Server started!");
})

