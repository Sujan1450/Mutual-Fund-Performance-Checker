const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.get("/fetch-json", (req, res) => {
	try {
		let data = fs.readFileSync("./backend/data.json", "utf8");
		data = JSON.parse(data);
		res.json(data);
	} catch (err) {
		console.error("Error reading the file:", err);
		res.json([]);
	}
});
app.post("/save-json", (req, res) => {
	let data = req.body;
	const index = data.findIndex((item) => item["__EMPTY"] === "Fund Name");
	if (index !== -1) {
		const targetObject = data[index];
		const valuesArray = Object.values(targetObject);
		data = data.slice(index + 1);
		const updatedData = data.map((item) => {
			const newItem = {};
			valuesArray.forEach((key, i) => {
				if (item[Object.keys(item)[i]] !== undefined) {
					newItem[key] = item[Object.keys(item)[i]];
				}
			});
			return newItem;
		});
		data = updatedData;
	}
	fs.writeFile(
		path.join(__dirname, "data.json"),
		JSON.stringify(data, null, 2),
		(err) => {
			if (err) {
				console.error("Error writing JSON file:", err);
				return res.status(500).send("Error saving file");
			}
			res.json(data);
		}
	);
});

https: app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
