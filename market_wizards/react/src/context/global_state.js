import React, { createContext, useReducer, useState, useEffect } from "react";
//import GlobalReducer from "./global_reducer";

//const initialState = {
//imgSrc: "",
//info: {}
//};

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  //const [state, dispatch] = useReducer(GlobalReducer, initialState);

  const now = new Date();
  const [params, setParams] = useState({
    symbol: "es",
    freq: "d",
    func: "refresh",
    date: `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now
      .getDate()
      .toString()
      .padStart(2, "0")}`,
    book: "",
    records: false,
    working: false,
    imgSrc: "",
    info: {}
  });

  useEffect(() => {
    console.log("provider");
    imageSrc();
  });

  //[
  //params.symbol,
  //params.freq,
  //params.func,
  //params.date,
  //params.book,
  //params.records
  //]

  function requestUrl() {
    const now = new Date();

    let url = `${window.location.origin}/service/chart`;
    url = `${url}&symbol=${params.symbol}&frequency=${params.freq}&function=${params.func}&date=${params.date}`;
    url = `${url}&book=${params.book}&records=${params.records.toString()}`;
    url = `${url}?timestemp=${Math.round(now.getTime() / 1000)}`;

    return url;
  }

  function imageSrc() {
    const url = requestUrl();
    console.log(url);
  }

  function forward() {
    setParams({
      ...params,
      func: "forward",
      working: true
    });
  }

  function backward() {
    setParams({
      ...params,
      func: "backward",
      working: true
    });
  }

  function symbolRequest(symbol) {
    setParams({
      ...params,
      symbol: symbol.toLowerCase(),
      func: "refresh",
      working: true
    });
  }

  function freqRequest(freq) {
    //assert(new RegExp(r"h|d|w|m").hasMatch(freq));
    setParams({
      ...params,
      func: "simple",
      freq: freq,
      working: true
    });
  }

  function inputsRequest(symbol, date, freq, book = "") {
    //assert(new RegExp(r"^[a-zA-Z]{2,6}(?:\d{2})*$").hasMatch(symbol));
    //assert(new RegExp(r"^[a-zA-Z]{1,6}(?:\d{1,2})*$").hasMatch(symbol));
    //assert(new RegExp(r"h|d|w|m").hasMatch(freq));
    //assert(new RegExp(r"^\d{8}$").hasMatch(time));
    //assert(new RegExp(r"^(?:\d{4}|\d{8})$").hasMatch(time));
    setParams({
      ...params,
      symbol: symbol,
      func: "refresh",
      freq: freq,
      date: date,
      book: book,
      working: true
    });
  }

  function recordsRequest(show) {
    setParams({
      ...params,
      records: show,
      working: true
    });
  }

  function randomDateRequest() {
    setParams({
      ...params,
      func: "randomDate"
    });
  }

  function infoRequest() {
    //if (params.working) {
    //return;
    //}

    setParams({
      ...params,
      func: "info"
    });

    let url = requestUrl();

    //var info = await HttpRequest.getString(url);
    //var m = json.decode(info);

    //_$info.add(m);
    //_$time.add(m["Time"]);
    //_time = m["Time"];
  }

  //function newKeyDownHandler(handler) {
  //dispatch({
  //type: "NEW_KEYDOWN_HANDLER",
  //payload: handler
  //});
  //}

  return (
    <GlobalContext.Provider
      value={{
        imgSrc: params.imgSrc,
        info: params.info,
        symbolRequest,
        freqRequest,
        inputsRequest,
        forward,
        backward,
        recordsRequest,
        randomDateRequest
        //infoRequest,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
