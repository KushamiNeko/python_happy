export default (state, action) => {
  switch (action.type) {
    case "NEW_KEYDOWN_HANDLER":
      return {
        ...state,
        keyDownHandlers: [...state.keyDownHandlers, action.payload]
      };
    default:
      return state;
  }
};
