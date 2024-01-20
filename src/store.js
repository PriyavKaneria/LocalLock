import { legacy_createStore as createStore } from "redux"
import { persistStore, persistReducer } from "redux-persist"
import AsyncStorage from "@react-native-async-storage/async-storage"
import hardSet from "redux-persist/lib/stateReconciler/hardSet"

import rootReducer from "./reducers"

const persistConfig = {
	key: "root",
	storage: AsyncStorage,
	stateReconciler: hardSet,
}

const pReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(pReducer)
export const persistor = persistStore(store)
