import { combineReducers } from "redux";
import PasswordsReducer from "./PasswordsReducer";
import SettingsReducer from "./SettingsReducer";

export default combineReducers({
  settings: SettingsReducer,
  passwords: PasswordsReducer,
});
