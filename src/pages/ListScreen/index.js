import { useState, useEffect, useLayoutEffect, useRef } from "react"
import {
	BackHandler,
	View,
	TouchableOpacity,
	TextInput,
	Text,
	StyleSheet,
	ToastAndroid,
	Alert,
	AppState,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import Modal from "react-native-modal"
import * as Clipboard from "expo-clipboard"

import AppLoading from "expo-app-loading"
import { useFonts } from "expo-font"
import CryptoJS from "react-native-crypto-js"
import * as SecureStore from "expo-secure-store"

import {
	Container,
	AddButton,
	AddButtonImage,
	PasswordsList,
	NoPasswords,
	NoPasswordsText,
	ModalButtonImage,
} from "./styles"

import PasswordItem from "../../components/PasswordItem"
import AddPasswordButton from "../../components/AddPasswordButton"

export default () => {
	const navigation = useNavigation()
	const passwordsData = useSelector((state) => state.passwords.passwords)
	const settings = useSelector((state) => state.settings.settings)
	const dispatch = useDispatch()
	const [modalVisible, setModalVisible] = useState(false)

	const [addPasswordMode, setAddPasswordMode] = useState(false)
	const [editReferenceMode, setEditReferenceMode] = useState(false)
	const [editPasswordMode, setEditPasswordMode] = useState(false)
	const [reference, setReference] = useState("")
	const [old_reference, setOldReference] = useState("")
	const [password, setPassword] = useState("")
	const [passwordVisible, setPasswordVisible] = useState(false)

	const toggleReferenceEditMode = () => {
		setEditReferenceMode(!editReferenceMode)
	}

	const togglePasswordEditMode = () => {
		setEditPasswordMode(!editPasswordMode)
	}

	useEffect(() => {
		const backHandler = BackHandler.addEventListener("hardwareBackPress", () =>
			BackHandler.exitApp()
		)
		return () => {
			backHandler.remove()
		}
	}, [])

	useEffect(() => {
		navigation.setOptions({
			title: "Passwords",
			headerLeft: false,
			headerRight: () => (
				<AddButton
					underlayColor='transparent'
					onPress={() => navigation.navigate("Settings")}>
					<AddButtonImage
						source={require("../../assets/settings.png")}
						style={{ tintColor: settings.darkMode ? "#fbfbfb" : "#000000" }}
					/>
				</AddButton>
			),
		})
	}, [settings.darkMode])

	useEffect(() => {
		const handleStateChange = (nextState) => {
			if (nextState === "background") {
				// The app is in the background
				// Lock the app
				navigation.navigate("Splash")
			}
		}
		AppState.addEventListener("change", () => {
			handleStateChange(AppState.currentState)
		})

		return () => {
			AppState.removeEventListener("change", () => {
				handleStateChange(AppState.currentState)
			})
		}
	}, [navigation])

	const handleViewPassword = async (_reference) => {
		setReference(_reference)
		setOldReference(_reference)
		const pinHash = await SecureStore.getItemAsync("pinHash")
		if (!pinHash) {
			ToastAndroid.show(
				"PIN not set. Please set a PIN to view passwords",
				ToastAndroid.SHORT
			)
			navigation.navigate("Splash")
			return
		}
		const decryptedPassword = CryptoJS.AES.decrypt(
			passwordsData[_reference],
			pinHash
		).toString(CryptoJS.enc.Utf8)
		setPassword(decryptedPassword)
		setModalVisible(true)
	}

	const handleAddPassword = () => {
		setAddPasswordMode(true)
		setReference("")
		setPassword("")
		setEditReferenceMode(true)
		setEditPasswordMode(true)
		setModalVisible(true)
	}

	const handleDeleteButton = () => {
		if (addPasswordMode || editReferenceMode || editPasswordMode) {
			setAddPasswordMode(false)
			setEditReferenceMode(false)
			setEditPasswordMode(false)
			setModalVisible(false)
			return
		}
		Alert.alert(
			"Delete password",
			"Are you sure you want to delete this password?",
			[
				{
					text: "Cancel",
					onPress: () => {
						setEditReferenceMode(false)
						setEditPasswordMode(false)
						setAddPasswordMode(false)
						setModalVisible(false)
					},
					style: "cancel",
				},
				{
					text: "Delete",
					onPress: () => {
						dispatch({
							type: "DELETE_PASSWORD",
							payload: {
								reference,
							},
						})
						setEditReferenceMode(false)
						setEditPasswordMode(false)
						setAddPasswordMode(false)
						setModalVisible(false)
					},
				},
			],
			{ cancelable: false }
		)
	}

	const handleOkSave = async () => {
		const trimmedReference = reference.trim()
		const trimmedPassword = password.trim()
		if (trimmedReference === "" || trimmedPassword === "") {
			ToastAndroid.show(
				"Reference and password cannot be empty",
				ToastAndroid.SHORT
			)
			return
		}
		const pinHash = await SecureStore.getItemAsync("pinHash")
		if (!pinHash) {
			ToastAndroid.show(
				"PIN not set. Please set a PIN to save passwords",
				ToastAndroid.SHORT
			)
			navigation.navigate("Splash")
			return
		}
		const encryptedPassword = CryptoJS.AES.encrypt(
			trimmedPassword,
			pinHash
		).toString()
		if (addPasswordMode) {
			if (Object.keys(passwordsData).includes(trimmedReference)) {
				ToastAndroid.show(
					"Reference with given name already exists",
					ToastAndroid.SHORT
				)
				return
			}
			// add password
			dispatch({
				type: "ADD_PASSWORD",
				payload: {
					reference: trimmedReference,
					password: encryptedPassword,
				},
			})
		} else if (editReferenceMode || editPasswordMode) {
			// save password
			dispatch({
				type: "EDIT_PASSWORD",
				payload: {
					reference: trimmedReference,
					password: encryptedPassword,
					old_reference,
				},
			})
		}
		setEditReferenceMode(false)
		setEditPasswordMode(false)
		setAddPasswordMode(false)
		setModalVisible(false)
	}

	let [fontsLoaded, error] = useFonts({
		"WorkSans-SemiBold": require("../../../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
		"WorkSans-Regular": require("../../../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
	})

	if (!fontsLoaded) {
		return <AppLoading />
	}

	const modalStyles = StyleSheet.create({
		nomargin: {
			margin: 0,
			color: settings.darkMode ? "#e8e8e8" : "black",
		},
		floatLeft: {
			textAlign: "left",
			alignSelf: "flex-start",
			paddingLeft: 10,
			color: settings.darkMode ? "#0f2b23" : "black",
		},
		root: {
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			padding: 10,
			paddingTop: 20,
			paddingBottom: 20,
			backgroundColor: settings.darkMode ? "#3d8a74" : "#f5f5f5",
			color: settings.darkMode ? "#e8e8e8" : "#091e42",
		},
		inputContainer: {
			flexDirection: "row",
			width: "100%",
			marginBottom: 10,
			marginLeft: 0,
			padding: 10,
		},
		input: {
			backgroundColor: settings.darkMode ? "#184d3e" : "#f5f5f5",
			borderColor: settings.darkMode ? "#545454" : "#dfe1e6",
			color: settings.darkMode ? "#e4e4e4" : "#091e42",
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
			paddingLeft: 10,
			paddingRight: 10,
		},
		deleteButton: {
			backgroundColor: settings.darkMode ? "#eb5746" : "red", // red background
			padding: 10,
			borderRadius: 5,
			width: "45%",
			alignItems: "center",
		},
		okButton: {
			backgroundColor: settings.darkMode ? "#5cedc4" : "green", // green background
			padding: 10,
			borderRadius: 5,
			width: "45%",
			alignItems: "center",
		},
		buttonText: {
			color: settings.darkMode ? "black" : "white",
			fontWeight: "bold",
			fontSize: 16,
		},
	})

	const screenStyles = StyleSheet.create({
		root: {
			backgroundColor: settings.darkMode ? "#252526" : "#ffffff",
		},
		textColor: {
			color: settings.darkMode ? "#e8e8e8" : "black",
		},
		image: {
			tintColor: settings.darkMode ? "#1e1e1e" : "black",
		},
	})

	return (
		<Container style={screenStyles.root}>
			<Modal
				animationIn={"zoomIn"}
				animationOut={"zoomOut"}
				isVisible={modalVisible}
				onRequestClose={() => {
					setEditReferenceMode(false)
					setEditPasswordMode(false)
					setAddPasswordMode(false)
					setModalVisible(false)
				}}
				style={{ margin: 0, marginLeft: 20, marginRight: 20 }}
				onBackdropPress={() => {
					setEditReferenceMode(false)
					setEditPasswordMode(false)
					setAddPasswordMode(false)
					setModalVisible(false)
				}}>
				<View style={modalStyles.root}>
					<Text style={modalStyles.floatLeft}>
						{editReferenceMode ? "Edit reference" : "Reference"}
					</Text>
					<View style={modalStyles.inputContainer}>
						<TextInput
							style={{
								...modalStyles.input,
								width: addPasswordMode || editReferenceMode ? "100%" : "90%",
							}}
							editable={editReferenceMode}
							onChangeText={(text) => setReference(text)}
							value={reference}
							placeholder='Enter reference text'
							placeholderTextColor={settings.darkMode ? "#9dcfaf" : "#a3a3a3"}
						/>
						{!addPasswordMode && (
							<TouchableOpacity onPress={toggleReferenceEditMode}>
								{!editReferenceMode && (
									<ModalButtonImage
										source={require("../../assets/edit.png")}
										style={screenStyles.image}
									/>
								)}
							</TouchableOpacity>
						)}
					</View>
					<Text style={modalStyles.floatLeft}>
						{editPasswordMode
							? "Edit password"
							: settings.longPressToCopy
							? "Password (tap & hold to see, long press to copy)"
							: "Password (tap and hold to see)"}
					</Text>
					<View style={modalStyles.inputContainer}>
						<TouchableOpacity
							onPressIn={() => setPasswordVisible(true)}
							onPressOut={() => setPasswordVisible(false)}
							onLongPress={() => {
								if (!editPasswordMode && settings.longPressToCopy) {
									// copy password to clipboard
									Clipboard.setStringAsync(password).then(() => {
										ToastAndroid.show(
											"Password copied to clipboard",
											ToastAndroid.SHORT
										)
									})
								}
							}}
							activeOpacity={1}
							style={{
								...modalStyles.input,
								width: addPasswordMode || editPasswordMode ? "100%" : "90%",
							}}>
							<TextInput
								style={modalStyles.nomargin}
								editable={editPasswordMode}
								onChangeText={(text) => setPassword(text)}
								value={password}
								placeholder='Enter password'
								placeholderTextColor={settings.darkMode ? "#9dcfaf" : "#a3a3a3"}
								secureTextEntry={!editPasswordMode && !passwordVisible}
							/>
						</TouchableOpacity>
						{!addPasswordMode && (
							<TouchableOpacity onPress={togglePasswordEditMode}>
								{!editPasswordMode && (
									<ModalButtonImage
										source={require("../../assets/edit.png")}
										style={screenStyles.image}
									/>
								)}
							</TouchableOpacity>
						)}
					</View>
					<View style={modalStyles.buttonContainer}>
						<TouchableOpacity
							style={modalStyles.deleteButton}
							onPress={handleDeleteButton}>
							<Text style={modalStyles.buttonText}>
								{editReferenceMode || editPasswordMode ? "Cancel" : "Delete"}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={modalStyles.okButton}
							onPress={handleOkSave}>
							<Text style={modalStyles.buttonText}>
								{editReferenceMode || editPasswordMode ? "Save" : "Ok"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
			<AddPasswordButton
				onPress={handleAddPassword}
				darkMode={settings.darkMode}
			/>
			{Object.keys(passwordsData).length > 0 && (
				<PasswordsList
					data={Object.keys(passwordsData)}
					renderItem={({ item, _ }) => (
						<PasswordItem
							reference={item}
							onPress={handleViewPassword}
							darkMode={settings.darkMode}
						/>
					)}
					keyExtractor={(item, index) => index.toString()}
					style={{ ...screenStyles.textColor, ...screenStyles.root }}
				/>
			)}
			{Object.keys(passwordsData).length === 0 && (
				<NoPasswords>
					<NoPasswordsText
						style={{
							fontFamily: "WorkSans-SemiBold",
							...screenStyles.textColor,
						}}>
						No passwords saved
					</NoPasswordsText>
				</NoPasswords>
			)}
		</Container>
	)
}
