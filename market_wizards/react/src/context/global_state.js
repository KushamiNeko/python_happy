import React, { createContext, useRef, useState } from "react";
//import GlobalReducer from "./global_reducer";

//const initialState = {
//imgSrc: "",
//info: {}
//};

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  //const [state, dispatch] = useReducer(GlobalReducer, initialState);

  const now = new Date();
  const refs = useRef({
    working: false,
    quote: null,
    src: ""
  });

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
    timestamp: 0
    //working: false,
    //imgSrc: null,
    //quote: null
  });

  //useEffect(() => {
  ////console.log(params.currrent);
  //imageSrc();
  ////params.current.imgSrc = requestUrl();
  //},
  //[
  //params.symbol,
  //params.freq,
  //params.func,
  //params.date,
  //params.book,
  //params.records,
  //params.timestamp,
  ////////params.working
  ////////imageSrc
  //],
  //);

  function requestUrl() {
    const origin = "http://127.0.0.1:5000";
    //const origin = "http://localhost:8080";
    const now = new Date();

    let url = `${origin}/service/chart`;
    //let url = `${origin}/service/plot/practice`;
    url = `${url}?timestemp=${Math.round(now.getTime() / 1000)}`;
    //url = `${url}&symbol=${params.symbol}&frequency=${params.freq}&function=${params.func}&date=${params.date}`;
    url = `${url}&symbol=${params.symbol}&frequency=${params.freq}&function=${params.func}&time=${params.date}`;
    url = `${url}&book=${params.book}&records=${params.records.toString()}`;

    return url;
  }

  function imageSrc() {
    if (refs.current.working) {
      return refs.current.src;
    }

    refs.current.working = true;

    const url = requestUrl();
    refs.current.src = url;

    return url;
  }

  function done() {
    refs.current.working = false;
  }

  function forward() {
    setParams({
      ...params,
      func: "forward",
      timestamp: Date.now()
    });
  }

  function backward() {
    setParams({
      ...params,
      func: "backward",
      timestamp: Date.now()
    });
  }

  function symbolRequest(symbol) {
    setParams({
      ...params,
      symbol: symbol.toLowerCase(),
      func: "refresh"
    });
  }

  function freqRequest(freq) {
    setParams({
      ...params,
      func: "simple",
      freq: freq
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
      book: book
    });
  }

  function recordsRequest(show) {
    //setParams({
      //...params,
      //records: show
    //});
  }

  function randomDateRequest() {
    //setParams({
    //...params,
    //func: "randomDate"
    //});
  }

  function quoteRequest() {
    //if (params.working) {
    //return;
    //}
    //setParams({
    //...params,
    //func: "quote"
    //});
    //let url = requestUrl();
    //var info = await HttpRequest.getString(url);
    //var m = json.decode(info);
    //_$info.add(m);
    //_$time.add(m["Time"]);
    //_time = m["Time"];
  }

  return (
    <GlobalContext.Provider
      value={{
        imgSrc: imageSrc(),
        quote: refs.current.quote,
        symbolRequest,
        freqRequest,
        inputsRequest,
        forward,
        backward,
        recordsRequest,
        done
        //randomDateRequest
        //quoteRequest,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
