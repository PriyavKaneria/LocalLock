import React from "react"
import "react-native-gesture-handler"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/lib/integration/react"
import { NavigationContainer } from "@react-navigation/native"

import { store, persistor } from "./src/store"

import MainStack from "./src/stacks/MainStack"

import { StatusBar } from "expo-status-bar"

export default () => {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<NavigationContainer>
					<StatusBar />
					<MainStack />
				</NavigationContainer>
			</PersistGate>
		</Provider>
	)
}
