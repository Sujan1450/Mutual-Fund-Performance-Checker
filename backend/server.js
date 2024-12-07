const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.json());

app.post("/save-json", (req, res) => {
	const data = req.body;

	fs.writeFile(
		path.join(__dirname, "data.json"),
		JSON.stringify(data, null, 2),
		(err) => {
			if (err) {
				console.error("Error writing JSON file:", err);
				return res.status(500).send("Error saving file");
			}
			res.send("File saved successfully");
		}
	);
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
