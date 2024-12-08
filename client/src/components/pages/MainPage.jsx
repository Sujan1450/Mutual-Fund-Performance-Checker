import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../context/context";
import FileUpload from "../../features/fileUpload/FileUpload";

function MainPage() {
	const { data, setData } = useContext(MyContext);
	const [groupedData, setGroupedData] = useState([]);
	const [totalFundsArray, setTotalFundsArray] = useState([]);
	const [selectedFundDates, setSelectedFundDates] = useState([]);
	const [uploadedFundNames, setUploadedFundNames] = useState([]);
	const [selectedFundNameA, setSelectedFundNameA] = useState("");
	const [selectedCompareFund, setSelectedCompareFund] = useState("");
	const [selectedCompareFundCode, setSelectedCompareFundCode] = useState();
	const [selectedExactFund, setSelectedExactFund] = useState("");
	const [exactFundCode, setExactFundCode] = useState();
	const [exactFundOptions, setExactFundOptions] = useState([]);
	const [chartData, setChartData] = useState([]);
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
					tempDates.push(element["Date"]);
				}
			});
			setSelectedFundDates(tempDates);
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
	const getNavValues = async () => {
		let navValues = [];
		try {
			const navPromises = selectedFundDates.map(async (date) => {
				let formattedDate = new Date(date).toISOString().split("T")[0];
				let responseA = await fetch(
					`https://api.mfapi.in/mf/${exactFundCode}?startDate=${formattedDate}&endDate=${formattedDate}`
				);
				let fundANav = await responseA.json();
				let responseB = await fetch(
					`https://api.mfapi.in/mf/${selectedCompareFundCode}?startDate=${formattedDate}&endDate=${formattedDate}`
				);
				let fundBNav = await responseB.json();
				if (fundBNav && fundBNav.data && fundBNav.data.length > 0) {
					navValues.push({
						date: date,
						[selectedExactFund]: Number(fundANav.data[0].nav),
						[selectedCompareFund]: Number(fundBNav.data[0].nav),
					});
				}
			});
			await Promise.all(navPromises);
			setChartData(navValues);
		} catch (error) {
			console.error("Error fetching nav:", error);
		}
	};
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
					tempDates.push(element["Date"]);
				}
			});
			setSelectedFundDates(tempDates);
		}
	}, [selectedFundNameA]);
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
			<div className="mt-10 mb-10">
				<FileUpload></FileUpload>
			</div>
			{uploadedFundNames.length > 0 && (
				<div className="flex">
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
								{exactFundOptions.map((name) => (
									<MenuItem key={name.schemeCode} value={name.schemeName}>
										{name.schemeName}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</div>
					<div className="mr-5">
						<Autocomplete
							disablePortal
							options={totalFundsArray}
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
			<div>
				<div id="chartDiv"></div>
			</div>
		</div>
	);
}

export default MainPage;
