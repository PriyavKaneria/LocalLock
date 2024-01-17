import { combineReducers } from "redux";
import NotesReducer from "./NotesReducer";

export default combineReducers({
  notes: NotesReducer,
});
