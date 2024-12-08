import React, { createContext, useState } from "react";

export const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
	const [data, setData] = useState([]);

	return (
		<MyContext.Provider value={{ data, setData }}>
			{children}
		</MyContext.Provider>
	);
};
