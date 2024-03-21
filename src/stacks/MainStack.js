import { createStackNavigator } from "@react-navigation/stack"

import Splash from "../pages/SplashAuth"
import ListScreen from "../pages/ListScreen"
import SettingsScreen from "../pages/SettingsScreen"
import { useSelector } from "react-redux"

const MainStack = createStackNavigator()

export default () => {
	const settings = useSelector((state) => state.settings.settings)
	return (
		<MainStack.Navigator
			screenOptions={{
				headerStyle: {
					backgroundColor: settings.darkMode ? "#1e1e1e" : "#fbfbfb",
				},
				headerTintColor: settings.darkMode ? "#fbfbfb" : "#1e1e1e",
			}}>
			<MainStack.Screen
				name='Splash'
				component={Splash}
				options={{
					headerShown: false,
				}}
			/>
			<MainStack.Screen name='List' component={ListScreen} />
			<MainStack.Screen name='Settings' component={SettingsScreen} />
		</MainStack.Navigator>
	)
}
