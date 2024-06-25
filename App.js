import { AppRegistry } from "react-native"
import { name as appName } from "./app.json"
import "react-native-gesture-handler"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/lib/integration/react"
import { NavigationContainer } from "@react-navigation/native"

import { store, persistor } from "./src/store"

import MainStack from "./src/stacks/MainStack"

import { StatusBar } from "expo-status-bar"
import { TourGuideProvider } from "rn-tourguide"

AppRegistry.registerComponent(appName, () => App)

export default () => {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<NavigationContainer>
					<TourGuideProvider androidStatusBarVisible={true}>
						<StatusBar />
						<MainStack />
					</TourGuideProvider>
				</NavigationContainer>
			</PersistGate>
		</Provider>
	)
}
