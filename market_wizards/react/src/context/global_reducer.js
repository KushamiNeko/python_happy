export default (state, action) => {
  switch (action.type) {
    case "RECORDS_REQUEST":
      console.log(action.payload);
      return state;
    case "NEW_KEYDOWN_HANDLER":
      return {
        ...state,
        keyDownHandlers: [...state.keyDownHandlers, action.payload]
      };
    default:
      return state;
  }
};
