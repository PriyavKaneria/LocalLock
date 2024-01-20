import { ScrollView, Switch } from "react-native-gesture-handler"
import { AddButton, AddButtonImage, Container, SettingsItem, SettingsItemText } from "./styles"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useLayoutEffect } from "react"

export default () => {
	const navigation = useNavigation()
	const dispatch = useDispatch()
	const settings = useSelector((state) => state.settings.settings)

	useLayoutEffect(() => {
		navigation.setOptions({
			title: "Settings",
			headerLeft: false,
			headerRight: () => (
				<AddButton
					underlayColor='transparent'
					onPress={() => navigation.navigate("List")}>
					<AddButtonImage source={require("../../assets/exit.png")} />
				</AddButton>
			),
		})
	}, [])

	return (
		<Container>
			<ScrollView>
				<SettingsItem>
					<SettingsItemText>
						Allow non-biometric authentication
					</SettingsItemText>
					<Switch
						trackColor={{ false: "#767577", true: "#81b0ff" }}
						thumbColor={settings.allowNonBiometric ? "#2a69d4" : "#f4f3f4"}
						ios_backgroundColor='#3e3e3e'
						onValueChange={() =>
							dispatch({
								type: "SET_ALLOW_NON_BIOMETRIC",
								payload: !settings.allowNonBiometric,
							})
						}
						value={settings.allowNonBiometric}
					/>
				</SettingsItem>
				<SettingsItem>
					<SettingsItemText>Long press to copy password</SettingsItemText>
					<Switch
						trackColor={{ false: "#767577", true: "#81b0ff" }}
						thumbColor={settings.longPressToCopy ? "#2a69d4" : "#f4f3f4"}
						ios_backgroundColor='#3e3e3e'
						onValueChange={() =>
							dispatch({
								type: "SET_LONG_PRESS_TO_COPY",
								payload: !settings.longPressToCopy,
							})
						}
						value={settings.longPressToCopy}
					/>
				</SettingsItem>
			</ScrollView>
		</Container>
	)
}
