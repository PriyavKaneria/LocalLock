import { legacy_createStore as createStore } from "redux"
import { persistStore, persistReducer, createMigrate } from "redux-persist"
import AsyncStorage from "@react-native-async-storage/async-storage"

import rootReducer from "./reducers"
import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2"

const migrations = {
	5: async (state) => {
		// Migrate the state reconciler from hardSet to autoMergeLevel2
		// Temp set complete state json
		await AsyncStorage.setItem(
			"migrate-conciler",
			JSON.stringify({
				passwords: state.passwords,
				settings: state.settings,
			})
		)
	},
}

const DEBUG = false

const persistConfig = {
	key: "root2",
	version: 5,
	storage: AsyncStorage,
	stateReconciler: autoMergeLevel2,
	migrate: createMigrate(migrations, { debug: DEBUG }),
	debug: DEBUG,
}

const pReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(pReducer)
export const persistor = persistStore(store, {}, async () => {
	const state = await AsyncStorage.getItem("migrate-conciler")
	// console.log("Migrate state", state)
	if (!state) {
		return
	}
	const parsedState = JSON.parse(state)
	// console.log("Parsed state", parsedState)
	if (parsedState.passwords) {
		store.dispatch({
			type: "SET_STATE_PASSWORDS",
			payload: {
				passwords: parsedState.passwords?.passwords ?? {},
				notes: parsedState.passwords?.notes ?? {},
			},
		})
	}
	if (parsedState.settings) {
		store.dispatch({
			type: "SET_STATE_SETTINGS",
			payload: {
				settings: parsedState.settings ?? {},
			},
		})
	}
	await AsyncStorage.removeItem("migrate-conciler")
})
