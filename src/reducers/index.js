import { combineReducers } from "redux";
import PasswordsReducer from "./PasswordsReducer";

export default combineReducers({
  passwords: PasswordsReducer,
});
