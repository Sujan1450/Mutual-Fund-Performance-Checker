import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import * as dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../context/context";
import RenderLineChart from "../../features/charts/LineChart";
import FileUpload from "../../features/fileUpload/FileUpload";
var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

function MainPage() {
	const { data, setData } = useContext(MyContext);
	const [groupedData, setGroupedData] = useState([]);
	const [totalFundsArray, setTotalFundsArray] = useState([]);
	const [selectedFundDate, setSelectedFundDate] = useState([]);
	const [uploadedFundNames, setUploadedFundNames] = useState([]);
	const [selectedFundNameA, setSelectedFundNameA] = useState("");
	const [selectedCompareFund, setSelectedCompareFund] = useState("");
	const [selectedCompareFundCode, setSelectedCompareFundCode] = useState();
	const [selectedExactFund, setSelectedExactFund] = useState("");
	const [exactFundCode, setExactFundCode] = useState();
	const [exactFundOptions, setExactFundOptions] = useState([]);
	const [chartData, setChartData] = useState([]);
	useEffect(() => {
		fetchData();
	}, []);
	const fetchData = async () => {
		try {
			const response = await fetch("http://localhost:5000/fetch-json", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const jsonData = await response.json();
			if (jsonData && jsonData.length > 0) {
				setData(jsonData);
				handleDataChange(jsonData);
				handleFundNameChange(jsonData[0]["Fund Name"], "FundA");
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};
	useEffect(() => {
		if (data && data.length > 0) {
			handleDataChange(data);
		}
	}, [data]);
	useEffect(() => {
		if (selectedFundNameA) {
			let tempData = groupedData[selectedFundNameA];
			let tempDates = [];
			tempData.forEach((element) => {
				if (
					element &&
					element["Transaction Type"] &&
					element["Transaction Type"] === "Purchase"
				) {
					tempDates.push(dayjs(element["Date"]).format("YYYY-MM-DD"));
				}
			});
			setSelectedFundDate(tempDates);
			getExactOptions();
		}
	}, [selectedFundNameA]);
	const getExactOptions = async () => {
		let exactOptions = await retrieveSearchService(selectedFundNameA);
		setExactFundOptions(exactOptions);
	};
	const retrieveSearchService = async (filter) => {
		if (filter) {
			try {
				const response = await fetch(
					`https://api.mfapi.in/mf/search?q=${filter}`
				);
				const data = await response.json();
				return data;
			} catch (error) {
				console.error("Error fetching nav:", error);
			}
		}
	};
	useEffect(() => {
		if (exactFundCode && selectedCompareFundCode) {
			getNavValues();
		}
	}, [exactFundCode, selectedCompareFundCode]);
	async function getNavValues() {
		try {
			let startDate = selectedFundDate[selectedFundDate.length - 1];
			let endDate = dayjs().format("YYYY-MM-DD");
			let urlA = `https://api.mfapi.in/mf/${exactFundCode}?startDate=${startDate}&endDate=${endDate}`;
			let urlB = `https://api.mfapi.in/mf/${selectedCompareFundCode}?startDate=${startDate}&endDate=${endDate}`;
			let [responseA, responseB] = await Promise.all([
				fetch(urlA),
				fetch(urlB),
			]);
			let fundANav = await responseA.json();
			let fundBNav = await responseB.json();
			if (
				fundANav &&
				fundANav.data &&
				fundANav.data.length > 0 &&
				fundBNav &&
				fundBNav.data &&
				fundBNav.data.length > 0
			) {
				genreateChartData(fundANav["data"], fundBNav["data"]);
			}
		} catch (error) {
			console.error("Error fetching nav:", error);
		}
	}
	function genreateChartData(fundAData, fundBData) {
		let navValues = [];
		let unitsA = 0;
		let unitsB = 0;
		for (let i = fundAData.length - 1; i > -1; i--) {
			let formattedDate = dayjs(fundAData[i].date, "DD-MM-YYYY").format(
				"YYYY-MM-DD"
			);
			let navA = fundAData[i].nav;
			let navB = fundBData[i] ? fundBData[i].nav : navA;
			if (selectedFundDate.includes(formattedDate)) {
				unitsA += 500 / navA;
				unitsB += 500 / navB;
				navValues.push({
					date: fundAData[i].date,
					[selectedExactFund]: unitsA * navA,
					[selectedCompareFund]: unitsB * navB,
				});
			} else {
				navValues.push({
					date: fundAData[i].date,
					[selectedExactFund]: unitsA * navA,
					[selectedCompareFund]: unitsB * navB,
				});
			}
		}

		setChartData(navValues);
	}

	const handleDataChange = (data) => {
		const temGroupedData = data.reduce((acc, item) => {
			const fundName = item["Fund Name"];
			if (!acc[fundName]) {
				acc[fundName] = [];
			}
			acc[fundName].push(item);
			return acc;
		}, {});
		let tempFundNames = Object.keys(temGroupedData);
		setUploadedFundNames(tempFundNames);
		setGroupedData(temGroupedData);
	};
	const handleFundNameChange = (name, type, value = undefined) => {
		if (type === "FundA") {
			setSelectedFundNameA(name);
		} else if (type === "exactFund") {
			setSelectedExactFund(name);
			setExactFundCode(value);
		} else {
			setSelectedCompareFund(name);
			setSelectedCompareFundCode(value);
		}
	};
	const searchFund = async (value) => {
		if (!value) return;
		let result = await retrieveSearchService(value);
		setTotalFundsArray(result);
	};

	return (
		<div className=" flex flex-col  items-center h-full">
			<div className="mt-5 mb-10">
				<FileUpload></FileUpload>
			</div>
			{uploadedFundNames.length > 0 && (
				<div className="flex ">
					<div className="mr-5">
						<FormControl sx={{ m: 1, width: 550 }}>
							<InputLabel id="demo-multiple-name-label">Fund Name</InputLabel>
							<Select
								labelId="demo-multiple-name-label"
								id="demo-multiple-name"
								onChange={(event) =>
									handleFundNameChange(event.target.value, "FundA")
								}
								value={selectedFundNameA}
								input={<OutlinedInput label="Fund Name" />}
							>
								<MenuItem disabled value="Select an option">
									<em>Select an option</em>
								</MenuItem>
								{uploadedFundNames.map((name) => (
									<MenuItem key={name} value={name}>
										{name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</div>
					<div className="mr-5">
						<FormControl sx={{ m: 1, width: 550 }}>
							<InputLabel id="demo-multiple-name-label">
								Exact Fund Name
							</InputLabel>
							<Select
								labelId="demo-multiple-name-label"
								id="demo-multiple-name"
								onChange={(event) => {
									const selectedName = event.target.value;
									const selectedFund = exactFundOptions.find(
										(fund) => fund.schemeName === selectedName
									);
									handleFundNameChange(
										selectedName,
										"exactFund",
										selectedFund ? selectedFund.schemeCode : undefined
									);
								}}
								value={selectedExactFund}
								input={<OutlinedInput label="Exact Fund Name" />}
							>
								<MenuItem disabled value="Select an option">
									<em>Select an option</em>
								</MenuItem>
								{exactFundOptions.map((name) =>
									name.schemeName &&
									name.schemeName.includes("Direct") &&
									name.schemeName.includes("Growth") ? (
										<MenuItem key={name.schemeCode} value={name.schemeName}>
											{name.schemeName}
										</MenuItem>
									) : null
								)}
							</Select>
						</FormControl>
					</div>
					<div className="mr-5">
						<Autocomplete
							disablePortal
							options={totalFundsArray.filter(
								(option) =>
									(option.schemeName &&
										option.schemeName.includes("Direct") &&
										option.schemeName.includes("Growth")) ||
									option.schemeName.includes("BeES") ||
									option.schemeName.includes("ELSS")
							)}
							getOptionLabel={(option) => option.schemeName}
							onInputChange={(event, value) => searchFund(value)}
							onChange={(event, selectedOption) => {
								if (selectedOption) {
									handleFundNameChange(
										selectedOption.schemeName,
										"compareFund",
										selectedOption.schemeCode
									);
								}
							}}
							sx={{ m: 1, width: 550 }}
							renderInput={(params) => (
								<TextField {...params} label="Compare Fund Name" />
							)}
						/>
					</div>
				</div>
			)}
			{chartData && chartData.length > 0 && (
				<div id="chartDiv" style={{ width: "99vw", height: "350px" }}>
					<RenderLineChart chartData={chartData}></RenderLineChart>
				</div>
			)}
		</div>
	);
}

export default MainPage;
