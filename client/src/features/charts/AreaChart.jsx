import React from "react";
import {
	Area,
	AreaChart,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const RenderAreaChart = (props) => {
	let lines =
		props.chartData && props.chartData.length > 0 ? props.chartData : [];
	lines = lines[0] ? Object.keys(lines[0]) : ["demo"];
	lines.splice(0, 1);
	return (
		<div style={{ width: "100%", height: "100%" }}>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					width={730}
					height={250}
					data={props.chartData}
					margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
				>
					<defs>
						<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
							<stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
						</linearGradient>
						<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
							<stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
						</linearGradient>
					</defs>
					<XAxis dataKey="name" tick={false} />
					<YAxis tickFormatter={(value) => `₹${value}`} />
					<Legend />
					<Tooltip
						formatter={(value) => {
							return `₹${value.toFixed(2)}`;
						}}
					/>
					<Area
						type="monotone"
						dataKey={lines[0]}
						stroke="#8884d8"
						fillOpacity={1}
						fill="url(#colorUv)"
					/>
					<Area
						type="monotone"
						dataKey={lines[1]}
						stroke="#82ca9d"
						fillOpacity={1}
						fill="url(#colorPv)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default RenderAreaChart;
