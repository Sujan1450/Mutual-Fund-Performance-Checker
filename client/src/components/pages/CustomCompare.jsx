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
import RenderAreaChart from "../../features/charts/AreaChart";
import RenderLineChart from "../../features/charts/LineChart";
import FileUpload from "../../features/fileUpload/FileUpload";
var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const CustomCompare = () => {
	const { data, setData } = useContext(MyContext);
	const [groupedData, setGroupedData] = useState([]);
	const [selectedDateWiseData, setSelectedDateWiseData] = useState([]);
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
	const [comparisonText, setComparisonText] = useState("");

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
			let tempDates = {};
			let totalUnits = 0;
			for (let i = tempData.length - 1; i >= 0; i--) {
				const element = tempData[i];
				if (element["Transaction Type"] === "Purchase") {
					totalUnits += element["Units Traded"];
				} else {
					totalUnits -= element["Units Traded"];
				}
				tempDates[dayjs(element["Date"]).format("YYYY-MM-DD")] = {
					units: totalUnits,
					nav: element["NAV"],
					amount: element["Amount"],
				};
			}
			setSelectedDateWiseData(tempDates);
			let datesArray = Object.keys(tempDates);
			setSelectedFundDate(datesArray);
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
			let startDate = selectedFundDate[0];
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
				let amountTraded = selectedDateWiseData[formattedDate].amount;
				unitsA += amountTraded / navA;
				unitsB += amountTraded / navB;
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
		const funds = Object.entries(navValues[navValues.length - 1]).filter(
			([key]) => key !== "date"
		);
		funds.sort((a, b) => b[1] - a[1]);
		const [highestFund, secondHighestFund] = funds;
		const percentageGain =
			((highestFund[1] - secondHighestFund[1]) / secondHighestFund[1]) * 100;
		let text =
			highestFund[0] +
			" beats " +
			secondHighestFund[0] +
			" by " +
			percentageGain.toFixed(2) +
			"%";
		setComparisonText(text);
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
		let totalUnitsByFund = {};
		for (const fundName in temGroupedData) {
			const transactions = temGroupedData[fundName];
			const totalUnits = transactions.reduce((sum, transaction) => {
				if (transaction["Transaction Type"] === "Purchase") {
					return sum + transaction["Units Traded"];
				} else {
					return sum - transaction["Units Traded"];
				}
			}, 0);
			if (totalUnits > 0) {
				totalUnitsByFund[fundName] = totalUnits;
			} else {
				delete temGroupedData[fundName];
			}
		}
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
		<div className="bg-[#282828] flex flex-col  items-center h-full">
			<div className="mt-5 mb-10">
				<FileUpload></FileUpload>
			</div>
			{uploadedFundNames.length > 0 && (
				<div className="flex ">
					<div className="mr-5">
						<FormControl sx={{ m: 1, width: 550 }}>
							<InputLabel id="demo-multiple-name-label">
								Portfolio Fund Name
							</InputLabel>
							<Select
								labelId="demo-multiple-name-label"
								id="demo-multiple-name"
								onChange={(event) =>
									handleFundNameChange(event.target.value, "FundA")
								}
								value={selectedFundNameA}
								input={<OutlinedInput label="Portfolio Fund Name" />}
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
							<InputLabel id="demo-multiple-name-label">Fund A</InputLabel>
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
								input={<OutlinedInput label="Fund A" />}
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
				<div id="chartDiv" className="w-[99vw] h-[550px] mt-10 pt -5">
					<RenderLineChart chartData={chartData}></RenderLineChart>
				</div>
				// <div id="chartDiv" className="w-[99vw] h-[550px] mt-10 pt -5">
				// 	<RenderAreaChart chartData={chartData}></RenderAreaChart>
				// </div>
			)}
			{comparisonText && <div>{comparisonText}</div>}
		</div>
	);
};

export default CustomCompare;
