import { ScrollView, Switch } from "react-native-gesture-handler"
import {
	AddButton,
	AddButtonImage,
	Container,
	SettingsItem,
	SettingsItemText,
} from "./styles"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import { useLayoutEffect, useState } from "react"
import {
	Button,
	StyleSheet,
	ToastAndroid,
	BackHandler,
	View,
	Text,
} from "react-native"
import * as Crypto from "expo-crypto"
import CryptoJS from "react-native-crypto-js"

import Modal from "react-native-modal"
import * as LocalAuthentication from "expo-local-authentication"
import SmoothPinCodeInput from "react-native-smooth-pincode-input"

export default () => {
	const navigation = useNavigation()
	const dispatch = useDispatch()
	const passwordsData = useSelector((state) => state.passwords.passwords)
	const settings = useSelector((state) => state.settings.settings)
	const [modalVisible, setModalVisible] = useState(false)
	const [pin, setPin] = useState("")

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
		BackHandler.addEventListener("hardwareBackPress", () => {
			setPin("")
			setModalVisible(false)
			navigation.navigate("List")
		})
	}, [])

	const handlePinInput = async (text) => {
		setPin(text)
		if (text.length === 4) {
			const inputPinHash = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				text
			)
			// Reencrypt all passwords with new PIN hash
			for (const key in passwordsData) {
				const decryptedPassword = CryptoJS.AES.decrypt(
					passwordsData[key],
					settings.pinHash
				).toString(CryptoJS.enc.Utf8)
				const encryptedPassword = CryptoJS.AES.encrypt(
					decryptedPassword,
					inputPinHash
				).toString()
				dispatch({
					type: "EDIT_PASSWORD",
					payload: {
						old_reference: key,
						reference: key,
						password: encryptedPassword,
					},
				})
			}
			dispatch({
				type: "SET_PIN_HASH",
				payload: inputPinHash,
			})
			ToastAndroid.show("New PIN set", ToastAndroid.SHORT)
			setPin("")
			setModalVisible(false)
		}
	}

	const handleResetPin = async () => {
		try {
			const results = await LocalAuthentication.authenticateAsync({
				disableDeviceFallback: true,
				cancelLabel: "Cancel",
			})

			if (results.success) {
				setModalVisible(true)
			} else if (results.error === "unknown") {
				ToastAndroid.show(
					"Biometric authentication disabled. Please enable it in your device settings.",
					ToastAndroid.LONG
				)
				BackHandler.exitApp()
			} else if (
				results.error === "user_cancel" ||
				results.error === "system_cancel" ||
				results.error === "app_cancel"
			) {
				// Allow user to use PIN instead
			}
		} catch (error) {
			ToastAndroid.show(
				"There was an error in authentication",
				ToastAndroid.LONG
			)
			BackHandler.exitApp()
		}
	}

	return (
		<Container>
			<Modal
				animationIn={"zoomIn"}
				animationOut={"zoomOut"}
				isVisible={modalVisible}
				onRequestClose={() => {
					setPin("")
					setModalVisible(false)
				}}
				style={{ margin: 0, marginLeft: 20, marginRight: 20 }}
				onBackdropPress={() => {
					setPin("")
					setModalVisible(false)
				}}>
				<View style={modalStyles.root}>
					<Text style={modalStyles.floatCenter}>Set PIN</Text>
					<View style={modalStyles.inputContainer}>
						<SmoothPinCodeInput
							cellStyle={{
								borderBottomWidth: 2,
								borderColor: "gray",
							}}
							cellStyleFocused={{
								borderColor: "black",
							}}
							password
							value={pin}
							onTextChange={(text) => handlePinInput(text)}
						/>
					</View>
				</View>
			</Modal>
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
				<SettingsItem>
					<SettingsItemText>
						Quick boot app (reduce animations)
					</SettingsItemText>
					<Switch
						trackColor={{ false: "#767577", true: "#81b0ff" }}
						thumbColor={settings.quickBoot ? "#2a69d4" : "#f4f3f4"}
						ios_backgroundColor='#3e3e3e'
						onValueChange={() =>
							dispatch({
								type: "SET_QUICK_BOOT",
								payload: !settings.quickBoot,
							})
						}
						value={settings.quickBoot}
					/>
				</SettingsItem>
				<SettingsItem>
					<Button title='Reset PIN' onPress={handleResetPin} />
				</SettingsItem>
			</ScrollView>
		</Container>
	)
}

const modalStyles = StyleSheet.create({
	nomargin: {
		margin: 0,
		color: "#091e42",
	},
	floatCenter: {
		textAlign: "center",
	},
	root: {
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
		paddingTop: 20,
		paddingBottom: 20,
		backgroundColor: "#f5f5f5", // light gray background
	},
	inputContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 10,
		padding: 10,
	},
	input: {
		backgroundColor: "#f5f5f5",
		borderColor: "#dfe1e6",
		color: "#091e42",
		borderRadius: 3,
		borderWidth: 2,
		borderStyle: "solid",
		fontSize: 20,
		paddingLeft: 8,
		paddingRight: 8,
		paddingTop: 6,
		paddingBottom: 6,
		height: 36,
		marginRight: 5,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	deleteButton: {
		backgroundColor: "red", // red background
		padding: 10,
		borderRadius: 5,
		width: "45%",
		alignItems: "center",
	},
	okButton: {
		backgroundColor: "green", // green background
		padding: 10,
		borderRadius: 5,
		width: "45%",
		alignItems: "center",
	},
	buttonText: {
		color: "white", // white text
		fontWeight: "bold",
		fontSize: 16,
	},
})
