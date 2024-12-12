import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import * as dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../context/context";
import RenderLineChart from "../../features/charts/LineChart";
var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const SipCompare = () => {
	const { data, setData } = useContext(MyContext);
	const [groupedData, setGroupedData] = useState([]);
	const [totalFundsArrayA, setTotalFundsArrayA] = useState([]);
	const [totalFundsArrayB, setTotalFundsArrayB] = useState([]);
	const [selectedStartDate, setSelectedStartDate] = useState("");
	const [selectedEndDate, setSelectedEndDate] = useState("");
	const [selectedSipDate, setSelectedSipDate] = useState();
	const [sipAmount, setSipAmount] = useState(500);
	const [selectedFundA, setSelectedFundA] = useState("");
	const [selectedFundB, setSelectedFundB] = useState("");
	const [selectedFundACode, setSelectedFundACode] = useState();
	const [selectedFundBCode, setSelectedFundBCode] = useState();
	const [chartData, setChartData] = useState([]);
	const [fundANav, setFundANav] = useState([]);
	const [fundBNav, setFundBNav] = useState([]);

	useEffect(() => {
		if (selectedFundA && selectedFundB) {
			getNavValues();
		}
	}, [selectedFundA, selectedFundB, selectedStartDate, selectedEndDate]);
	useEffect(() => {
		if (selectedFundA && selectedFundB) {
			genreateChartData(fundANav, fundBNav);
		}
	}, [sipAmount, selectedSipDate]);
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
	async function getNavValues() {
		try {
			let startDate = selectedStartDate
				? selectedStartDate
				: dayjs().subtract(3, "month").format("YYYY-MM-DD");
			let endDate = selectedEndDate
				? selectedEndDate
				: dayjs().format("YYYY-MM-DD");
			let urlA = `https://api.mfapi.in/mf/${selectedFundACode}?startDate=${startDate}&endDate=${endDate}`;
			let urlB = `https://api.mfapi.in/mf/${selectedFundBCode}?startDate=${startDate}&endDate=${endDate}`;
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
				setFundANav(fundANav["data"]);
				setFundBNav(fundBNav["data"]);
				genreateChartData(fundANav["data"], fundBNav["data"]);
			}
		} catch (error) {
			console.error("Error fetching nav:", error);
		}
	}
	function genreateChartData(fundAData, fundBData) {
		if (fundAData && fundBData) {
			let navValues = [];
			let unitsA = 0;
			let unitsB = 0;
			let isMonthStart = true;
			let tempSipAmount = sipAmount ? sipAmount : 500;
			for (let i = fundAData.length - 1; i > -1; i--) {
				let formattedDate = dayjs(fundAData[i].date, "DD-MM-YYYY").format(
					"YYYY-MM-DD"
				);
				if (!fundBData[i]) {
					continue;
				}
				let navA = fundAData[i].nav;
				let navB = fundBData[i].nav;
				if (isMonthStart || navValues.length === 0) {
					unitsA += tempSipAmount / navA;
					unitsB += tempSipAmount / navB;
				}
				navValues.push({
					date: formattedDate,
					[selectedFundA]: unitsA * navA,
					[selectedFundB]: unitsB * navB,
				});
				isMonthStart =
					dayjs(formattedDate).date() ===
					(selectedSipDate ? selectedSipDate : 4);
			}

			setChartData(navValues);
		}
	}
	const searchFund = async (value, type) => {
		if (!value) return;
		let result = await retrieveSearchService(value);
		if (type === "A") {
			setTotalFundsArrayA(result);
		} else {
			setTotalFundsArrayB(result);
		}
	};
	return (
		<div className="bg-[#282828] flex flex-col  items-center w-full h-full">
			<div className="flex">
				<div className="mb-5">
					<Autocomplete
						disablePortal
						options={totalFundsArrayA.filter(
							(option) =>
								(option &&
									option.schemeName &&
									option.schemeName.includes("Direct") &&
									option.schemeName.includes("Growth")) ||
								option.schemeName.includes("BeES") ||
								option.schemeName.includes("ELSS")
						)}
						getOptionLabel={(option) => option.schemeName}
						onInputChange={(event, value) => searchFund(value, "A")}
						onChange={(event, selectedOption) => {
							if (selectedOption) {
								setSelectedFundA(selectedOption.schemeName);
								setSelectedFundACode(selectedOption.schemeCode);
							}
						}}
						sx={{ m: 1, width: 200 }}
						renderInput={(params) => (
							<TextField {...params} label="Select Fund A" />
						)}
					/>
				</div>
				<div className="mb-5">
					<Autocomplete
						disablePortal
						options={totalFundsArrayB.filter(
							(option) =>
								(option &&
									option.schemeName &&
									option.schemeName.includes("Direct") &&
									option.schemeName.includes("Growth")) ||
								option.schemeName.includes("BeES") ||
								option.schemeName.includes("ELSS")
						)}
						getOptionLabel={(option) => option.schemeName}
						onInputChange={(event, value) => searchFund(value, "B")}
						onChange={(event, selectedOption) => {
							if (selectedOption) {
								setSelectedFundB(selectedOption.schemeName);
								setSelectedFundBCode(selectedOption.schemeCode);
							}
						}}
						sx={{ m: 1, width: 200 }}
						renderInput={(params) => (
							<TextField {...params} label="Select Fund B" />
						)}
					/>
				</div>
				<div className="mt-2">
					<TextField
						sx={{ width: 200 }}
						id="outlined-basic"
						label="SIP Amount"
						variant="outlined"
						value={sipAmount}
						onChange={(event) => setSipAmount(event.target.value)}
					/>
				</div>
				<div className="mb-5">
					<TextField
						sx={{ m: 1, width: 200 }}
						id="outlined-password-input"
						label="SIP Date"
						type="number"
						inputProps={{
							min: 1,
							max: 31,
						}}
						value={selectedSipDate}
						onChange={(event) => {
							let value = event.target.value;
							if (Number(value) <= 31 && Number(value) > 0) {
								setSelectedSipDate(Number(value));
							} else {
								setSelectedSipDate(0);
							}
						}}
					/>
				</div>
				<div>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DemoContainer components={["DatePicker"]}>
							<DatePicker
								label="SIP Start Date"
								onChange={(newValue) => {
									if (newValue && newValue.isValid()) {
										setSelectedStartDate(newValue.format("YYYY-MM-DD"));
									}
								}}
								minDate={dayjs().subtract(4, "years")}
								maxDate={selectedEndDate ? dayjs(selectedEndDate) : dayjs()}
								defaultCalendarMonth={dayjs().month()}
								defaultCalendarYear={dayjs().year()}
							/>
						</DemoContainer>
					</LocalizationProvider>
				</div>
				<div>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DemoContainer components={["DatePicker"]}>
							<DatePicker
								label="SIP End Date"
								onChange={(newValue) => {
									if (newValue && newValue.isValid()) {
										setSelectedEndDate(newValue.format("YYYY-MM-DD"));
									}
								}}
								minDate={dayjs(selectedStartDate)}
								maxDate={dayjs()}
								defaultCalendarMonth={dayjs().month()}
								defaultCalendarYear={dayjs().year()}
							/>
						</DemoContainer>
					</LocalizationProvider>
				</div>
			</div>

			{chartData && chartData.length > 0 && (
				<div id="chartDiv" className="w-[99vw] h-[550px] mt-10 pt -5">
					<RenderLineChart chartData={chartData}></RenderLineChart>
				</div>
			)}
		</div>
	);
};

export default SipCompare;
