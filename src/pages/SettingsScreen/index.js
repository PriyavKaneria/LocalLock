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
import { useEffect, useLayoutEffect, useState } from "react"
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
import * as SecureStore from "expo-secure-store"
import { setStatusBarStyle } from "expo-status-bar"

export default () => {
	const navigation = useNavigation()
	const dispatch = useDispatch()
	const passwordsData = useSelector((state) => state.passwords.passwords)
	const settings = useSelector((state) => state.settings.settings)
	const [modalVisible, setModalVisible] = useState(false)
	const [pin, setPin] = useState("")

	useEffect(() => {
		navigation.setOptions({
			title: "Settings",
			headerLeft: false,
			headerRight: () => (
				<AddButton
					underlayColor='transparent'
					onPress={() => navigation.navigate("List")}>
					<AddButtonImage
						source={require("../../assets/exit.png")}
						style={{ tintColor: settings.darkMode ? "#fbfbfb" : "#000000" }}
					/>
				</AddButton>
			),
		})
	}, [settings.darkMode])

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			() => {
				setPin("")
				setModalVisible(false)
				navigation.navigate("List")
			}
		)
		return () => {
			backHandler.remove()
		}
	}, [])

	const handlePinInput = async (text) => {
		setPin(text)
		if (text.length === 4) {
			const pinHash = await SecureStore.getItemAsync("pinHash")
			if (!pinHash) {
				ToastAndroid.show(
					"PIN not set. Please set a PIN to save passwords",
					ToastAndroid.SHORT
				)
				navigation.navigate("Splash")
				return
			}
			const inputPinHash = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				text
			)
			// Reencrypt all passwords with new PIN hash
			for (const key in passwordsData) {
				const decryptedPassword = CryptoJS.AES.decrypt(
					passwordsData[key],
					pinHash
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
			await SecureStore.setItemAsync("pinHash", inputPinHash)
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

	const modalStyles = StyleSheet.create({
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
			backgroundColor: settings.darkMode ? "#171717" : "#f5f5f5", // dark or light gray background
		},
		inputContainer: {
			flexDirection: "row",
			justifyContent: "center",
			marginBottom: 10,
			padding: 10,
		},
	})
	const screenStyles = StyleSheet.create({
		root: {
			backgroundColor: settings.darkMode ? "#171717" : "#f5f5f5", // dark or light gray background
		},
		textColor: {
			color: settings.darkMode ? "white" : "black",
		},
		trackColor: {
			false: "#767577",
			true: "#81b0ff",
		},
		thumbColor: {
			false: "#f4f3f4",
			true: "#2a69d4",
		},
		iosBackgroundColor: "#3e3e3e",
	})

	return (
		<Container style={screenStyles.root}>
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
								borderColor: settings.darkMode ? "white" : "black",
							}}
							textStyleFocused={{
								color: settings.darkMode ? "white" : "black",
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
					<SettingsItemText style={screenStyles.textColor}>
						Allow non-biometric authentication
					</SettingsItemText>
					<Switch
						trackColor={screenStyles.trackColor}
						thumbColor={
							settings.allowNonBiometric
								? screenStyles.thumbColor.true
								: screenStyles.thumbColor.false
						}
						ios_backgroundColor={screenStyles.iosBackgroundColor}
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
					<SettingsItemText style={screenStyles.textColor}>
						Long press to copy password
					</SettingsItemText>
					<Switch
						trackColor={screenStyles.trackColor}
						thumbColor={
							settings.longPressToCopy
								? screenStyles.thumbColor.true
								: screenStyles.thumbColor.false
						}
						ios_backgroundColor={screenStyles.iosBackgroundColor}
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
					<SettingsItemText style={screenStyles.textColor}>
						Quick boot app (reduce animations)
					</SettingsItemText>
					<Switch
						trackColor={screenStyles.trackColor}
						thumbColor={
							settings.quickBoot
								? screenStyles.thumbColor.true
								: screenStyles.thumbColor.false
						}
						ios_backgroundColor={screenStyles.iosBackgroundColor}
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
					<SettingsItemText style={screenStyles.textColor}>
						Dark mode
					</SettingsItemText>
					<Switch
						trackColor={screenStyles.trackColor}
						thumbColor={
							settings.darkMode
								? screenStyles.thumbColor.true
								: screenStyles.thumbColor.false
						}
						ios_backgroundColor={screenStyles.iosBackgroundColor}
						onValueChange={() => {
							dispatch({
								type: "SET_DARK_MODE",
								payload: !settings.darkMode,
							})
						}}
						value={settings.darkMode}
					/>
				</SettingsItem>
				<SettingsItem>
					<Button title='Reset PIN' onPress={handleResetPin} />
				</SettingsItem>
			</ScrollView>
		</Container>
	)
}
