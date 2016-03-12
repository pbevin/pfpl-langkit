import { combineReducers } from "redux";
import { programReducer as program } from "../kits/programKit";

const rootReducer = combineReducers({
  program
});

export default rootReducer;
