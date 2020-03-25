import React from "react";
import "./App.scss";
import Navbar from "./components/navbar/navbar";
import PracticeView from "./view/practice/practice";
//import { GlobalProvider } from "./context/global_state";

//<GlobalProvider>
//</GlobalProvider>
function App() {
  return (
    <div className="App">
      <Navbar />
      <PracticeView />
    </div>
  );
}

export default App;
