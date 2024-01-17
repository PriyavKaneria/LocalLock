const initialState = {
  list: [],
};

export default (state = initialState, action) => {
  let newList = [...state.list];

  switch (action.type) {
    case "ADD_NOTE":
      newList.push({
        title: action.payload.title,
        body: action.payload.body,
        done: false,
      });

      break;

    case "EDIT_NOTE":
      if (newList[action.payload.key]) {
        newList[action.payload.key] = {
          title: action.payload.title,
          body: action.payload.body,
          done: action.payload.done,
        };
      }
      break;

    case "DELETE_NOTE":
      newList = newList.filter((item, index) => index !== action.payload.key);
      break;

    case "SUCCESS_NOTE":
      if (newList[action.payload.key]) {
        newList[action.payload.key] = {
          title: action.payload.title,
          body: action.payload.body,
          done: true,
        };
      }
      break;

    case "UNCHECK_NOTE":
      if (newList[action.payload.key]) {
        newList[action.payload.key] = {
          title: action.payload.title,
          body: action.payload.body,
          done: false,
        };
      }
      break;
  }

  return { ...state, list: newList };
};
