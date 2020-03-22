import React from "react";
import "./App.scss";
import Navbar from "./components/navbar/navbar";
import PracticeView from "./view/practice/practice";
import { GlobalProvider } from "./context/global_state";

function App() {
  return (
    <GlobalProvider>
      <div className="App">
        <Navbar />
        <PracticeView />
      </div>
    </GlobalProvider>
  );
}

export default App;
