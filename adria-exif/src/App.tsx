import './App.css'
import {AdrianMap} from "./components/AdrianMap.tsx";
import {AdrianViewer} from "./components/AdrianViewer.tsx";
import {Provider} from "react-redux";
import {store} from "./store/store.ts";

function App() {

	return (
		<Provider store={store}
				  >

			<div className={"app-container"}>

				<div className={"half"}>

					<div>
						<AdrianViewer/>
					</div>
					<div>
						<AdrianMap/>

					</div>
				</div>

			</div>
		</Provider>

	)
}

export default App
