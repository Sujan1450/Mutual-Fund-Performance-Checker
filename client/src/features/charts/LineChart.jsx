import React, { useState } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const RenderLineChart = (props) => {
	let lines =
		props.chartData && props.chartData.length > 0 ? props.chartData : [];
	lines = lines[0] ? Object.keys(lines[0]) : ["demo"];
	lines.splice(0, 1);
	return (
		<div style={{ width: "100%", height: "100%" }}>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					width={500}
					height={300}
					data={props.chartData}
					margin={{
						top: 5,
						right: 30,
						left: 20,
						bottom: 5,
					}}
				>
					<XAxis dataKey="date" tick={false} />
					<YAxis tickFormatter={(value) => `₹${value.toFixed(2)}`} />
					<Tooltip
						formatter={(value) => {
							return `₹${value.toFixed(2)}`;
						}}
					/>
					<Legend />
					<Line
						type="monotone"
						dataKey={lines[0]}
						stroke="#8884d8"
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey={lines[1]}
						stroke="#82ca9d"
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default RenderLineChart;
