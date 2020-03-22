import React, { createContext, useReducer } from "react";
import GlobalReducer from "./global_reducer";

const initialState = {
  mouseMoveHandlers: [],
  mouseClickHandlers: [],
  keyDownHandlers: []
};

export const GlobalContext = createContext(initialState);

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(GlobalReducer, initialState);

  function newKeyDownHandler(handler) {
    dispatch({
      type: "NEW_KEYDOWN_HANDLER",
      payload: handler
    });
  }

  return (
    <GlobalContext.Provider
      value={{
        //mouseMoveHandlers: state.mouseMoveHandlers,
        //mouseClickHandlers: state.mouseClickHandlers,
        keyDownHandlers: state.keyDownHandlers,
        newKeyDownHandler
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
