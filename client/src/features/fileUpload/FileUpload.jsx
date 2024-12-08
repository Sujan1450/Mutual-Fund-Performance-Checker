import React, { useContext, useState } from "react";
import { IconContext } from "react-icons";
import { FaFileAlt } from "react-icons/fa";
import { IoIosCloudUpload } from "react-icons/io";
import * as XLSX from "xlsx";
import { MyContext } from "../../context/context";
import "./FileUpload.css";

const FileUpload = () => {
	const [progressFiles, setProgressFiles] = useState([]);
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const { data, setData } = useContext(MyContext);

	const handleClick = () => {
		document.querySelector(".file-input").click();
	};

	const onFileChange = ({ target }) => {
		const file = target.files[0];
		if (file) {
			let fileName = file.name;
			if (fileName.length >= 12) {
				const splitName = fileName.split(".");
				fileName = splitName[0].substring(0, 13) + "... ." + splitName[1];
			}
			uploadFile(fileName, file);
		}
	};
	const handleSave = (jsonData) => {
		fetch("http://localhost:5000/save-json", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(jsonData),
		})
			.then((response) => {
				if (response.ok) {
					console.log("JSON file saved successfully!");
					return response.json();
				} else {
					console.error("Failed to save JSON file.");
				}
			})
			.then((savedData) => {
				setData(savedData);
			})
			.catch((error) => console.error("Error:", error));
	};
	const uploadFile = (name, file) => {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", "php/upload.php");
		xhr.onload = () => {
			if (xhr.status === 404) {
				const reader = new FileReader();
				reader.onloadend = (event) => {
					const workbook = XLSX.read(event.target.result, { type: "binary" });
					const sheetName = workbook.SheetNames[0];
					const sheet = workbook.Sheets[sheetName];
					const sheetData = XLSX.utils.sheet_to_json(sheet);
					handleSave(sheetData);
				};
				reader.readAsBinaryString(file);
			}
		};
		xhr.upload.addEventListener("progress", ({ loaded, total }) => {
			const fileLoaded = Math.floor((loaded / total) * 100);
			const fileSize =
				total < 1024 * 1024
					? `${(total / 1024).toFixed(2)} KB`
					: `${(total / (1024 * 1024)).toFixed(2)} MB`;

			setProgressFiles([{ name, progress: fileLoaded }]);

			if (fileLoaded === 100) {
				setProgressFiles([]);
				setUploadedFiles([{ name, size: fileSize }]);
			}
		});

		const formData = new FormData();
		formData.append("file", file);
		xhr.send(formData);
	};
	return (
		<div className="wrapper">
			<header>Upload Transaction File</header>
			<form action="#">
				<div
					className="flex flex-col items-center justify-center"
					onClick={handleClick}
				>
					<input
						className="file-input"
						type="file"
						name="file"
						hidden
						onChange={onFileChange}
						accept=".xlsx, .csv"
					/>
					<IconContext.Provider value={{ color: "#6990F2", size: "2em" }}>
						<div>
							<IoIosCloudUpload />
						</div>
					</IconContext.Provider>
					<p>Browse File to Upload</p>
				</div>
			</form>
			<section className="progress-area">
				{progressFiles.map((file, index) => (
					<li key={index} className="row">
						<IconContext.Provider value={{ color: "#6990F2", size: "2em" }}>
							<div>
								<FaFileAlt />
							</div>
						</IconContext.Provider>

						<div className="content">
							<div className="details">
								<span className="name">{file.name} • Uploading</span>
								<span className="percent">{file.progress}%</span>
							</div>
							<div className="progress-bar">
								<div
									className="progress"
									style={{ width: `${file.progress}%` }}
								></div>
							</div>
						</div>
					</li>
				))}
			</section>
			<section className="uploaded-area">
				{uploadedFiles.map((file, index) => (
					<li key={index} className="row">
						<div className="content upload">
							<IconContext.Provider value={{ color: "#6990F2", size: "3em" }}>
								<div>
									<FaFileAlt />
								</div>
							</IconContext.Provider>
							<div className="details">
								<span className="name">{file.name} • Uploaded</span>
								<span className="size">{file.size}</span>
							</div>
						</div>
						<i className="fas fa-check"></i>
					</li>
				))}
			</section>
		</div>
	);
};

export default FileUpload;
