import React from "react"
import "react-native-gesture-handler"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/lib/integration/react"
import { NavigationContainer } from "@react-navigation/native"

import { store, persistor } from "./src/store"

import MainStack from "./src/stacks/MainStack"
import { TourProvider } from "./src/components/TourComponent"

import { StatusBar } from "expo-status-bar"

export default () => {
	const tourSteps = [
		{
			selector: "step1",
			content: "Click here to add a new password.",
		},
		{
			selector: "step2",
			content: "Add a unique reference for your password.",
		},
		// {
		// 	selector: "step3",
		// 	content: "Add the password.",
		// },
		// {
		// 	selector: "step4",
		// 	content: "Optionally, add a note with additional information.",
		// },
		// {
		// 	selector: "step5",
		// 	content: "Click here to save your password.",
		// },
		// {
		// 	selector: "step6",
		// 	content: "Your passwords will be listed here with last updated on top.",
		// },
		// {
		// 	selector: "step7",
		// 	content: "Click here to access the settings.",
		// },
		// {
		// 	selector: "step8",
		// 	content: "You can change the theme and also reset your PIN here anytime",
		// },
	]

	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<NavigationContainer>
					<TourProvider steps={tourSteps}>
						<StatusBar />
						<MainStack />
					</TourProvider>
				</NavigationContainer>
			</PersistGate>
		</Provider>
	)
}
