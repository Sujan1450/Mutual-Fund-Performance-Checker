import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../context/context";
import CustomCompare from "./CustomCompare";
import SipCompare from "./SipCompare";

function MainPage() {
	const { data, setData } = useContext(MyContext);
	const [groupedData, setGroupedData] = useState([]);
	const [chartData, setChartData] = useState([]);
	const [selectedCompareOption, setSelectedCompareOption] = useState("");
	const compareOptions = ["Sip", "LumpSum", "Custom Compare"];

	return (
		<div className="w-[100vw] h-[100vh] bg-[#282828]">
			<div className="pt-5">
				<FormControl sx={{ m: 1, width: 550 }}>
					<InputLabel id="demo-multiple-name-label">
						Select Comparison Method
					</InputLabel>
					<Select
						labelId="demo-multiple-name-label"
						id="demo-multiple-name"
						onChange={(event) => setSelectedCompareOption(event.target.value)}
						value={selectedCompareOption}
						input={<OutlinedInput label="Select Comparison Method" />}
						sx={{
							"& .MuiSelect-select": { color: "#fff" },
							"& .MuiOutlinedInput-input": { color: "#fff" },
							"& .MuiInputLabel-root": {
								color: "#fff",
							},
						}}
					>
						<MenuItem disabled value="Select an option">
							<em>Select an option</em>
						</MenuItem>
						{compareOptions.map((e) => (
							<MenuItem key={e} value={e}>
								{e}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</div>
			{selectedCompareOption && selectedCompareOption === "Sip" && (
				<div>
					<SipCompare />
				</div>
			)}
			{selectedCompareOption && selectedCompareOption === "Custom Compare" && (
				<div>
					<CustomCompare />
				</div>
			)}
			<div></div>
		</div>
	);
}

export default MainPage;
