import "./App.css";
import MainPage from "./components/pages/MainPage";
import { MyContextProvider } from "./context/context";

function App() {
	return (
		<MyContextProvider>
			<div className="App">
				<MainPage></MainPage>
			</div>
		</MyContextProvider>
	);
}

export default App;
