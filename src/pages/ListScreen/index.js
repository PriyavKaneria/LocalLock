import { useState, useEffect, useRef } from "react"
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
	ScrollView,
	Button,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import Modal from "react-native-modal"
import * as Clipboard from "expo-clipboard"

import AppLoading from "expo-app-loading"
import { useFonts } from "expo-font"
import CryptoJS from "react-native-crypto-js"

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
import { getSecureStoreItemAsync } from "../../utils/secure_store"
import { TourGuideZone, useTourGuideController } from "rn-tourguide"

export default () => {
	const navigation = useNavigation()
	const passwordsData = useSelector((state) => state.passwords.passwords)
	const notesData = useSelector((state) => state.passwords.notes)
	const settings = useSelector((state) => state.settings.settings)
	const dispatch = useDispatch()
	const [modalVisible, setModalVisible] = useState(false)

	const [addPasswordMode, setAddPasswordMode] = useState(false)
	const [editReferenceMode, setEditReferenceMode] = useState(false)
	const [editPasswordMode, setEditPasswordMode] = useState(false)
	const [editNoteMode, setEditNoteMode] = useState(false)
	const [reference, setReference] = useState("")
	const [old_reference, setOldReference] = useState("")
	const [password, setPassword] = useState("")
	const [passwordVisible, setPasswordVisible] = useState(false)
	const [note, setNote] = useState("")

	const toggleReferenceEditMode = () => {
		setEditReferenceMode(!editReferenceMode)
	}

	const togglePasswordEditMode = () => {
		setEditPasswordMode(!editPasswordMode)
	}

	const toggleNoteEditMode = () => {
		setEditNoteMode(!editNoteMode)
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
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						justifyContent: "flex-end",
						alignItems: "center",
					}}>
					<Text
						onPress={() => {
							dispatch({
								type: "SET_TUTORIAL_COMPLETED",
								payload: false,
							})
							setTour("home")
						}}
						style={{
							color: settings.darkMode ? "#fbfbfb" : "black",
							marginRight: 20,
						}}>
						Help
					</Text>
					<AddButton
						underlayColor='transparent'
						onPress={() => navigation.navigate("Settings")}>
						<AddButtonImage
							source={require("../../assets/settings.png")}
							style={{ tintColor: settings.darkMode ? "#fbfbfb" : "black" }}
						/>
					</AddButton>
				</View>
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

	const handleViewReferenceModal = async (_reference) => {
		setReference(_reference)
		setOldReference(_reference)
		const pinHash = await getSecureStoreItemAsync("pinHash")
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
		if (!notesData[_reference]) {
			dispatch({
				type: "INITIALIZE_NOTE",
				payload: {
					reference: _reference,
				},
			})
		}
		setNote(notesData[_reference] ?? "")
		setModalVisible(true)
	}

	const setAllFieldsEditMode = (mode) => {
		setEditReferenceMode(mode)
		setEditPasswordMode(mode)
		setEditNoteMode(mode)
	}

	const handleAddPassword = () => {
		setAddPasswordMode(true)
		setReference("")
		setPassword("")
		setNote("")
		setAllFieldsEditMode(true)
		setModalVisible(true)
		stop() // stop the tourguide
		// check if tutorial is to be shown
		if (!settings.tutorialCompleted) {
			setTimeout(() => {
				setTour("modal")
			}, 1000)
		}
	}

	const handleDeleteButton = () => {
		if (addPasswordMode || editReferenceMode || editPasswordMode) {
			setAddPasswordMode(false)
			setAllFieldsEditMode(false)
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
						setAllFieldsEditMode(false)
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
						setAllFieldsEditMode(false)
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
		const trimmedNote = note.trim()
		if (trimmedReference === "" || trimmedPassword === "") {
			ToastAndroid.show(
				"Reference and password cannot be empty",
				ToastAndroid.SHORT
			)
			return
		}
		const pinHash = await getSecureStoreItemAsync("pinHash")
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
					note: trimmedNote,
				},
			})
		} else if (editReferenceMode || editPasswordMode || editNoteMode) {
			if (
				editReferenceMode &&
				old_reference !== trimmedReference &&
				Object.keys(passwordsData).includes(trimmedReference)
			) {
				ToastAndroid.show(
					"Reference with given name already exists",
					ToastAndroid.SHORT
				)
				return
			}
			// save password
			dispatch({
				type: "EDIT_PASSWORD",
				payload: {
					reference: trimmedReference,
					password: encryptedPassword,
					old_reference,
					note: trimmedNote,
				},
			})
		}
		setAllFieldsEditMode(false)
		setAddPasswordMode(false)
		setModalVisible(false)
		// finish tour in case it is running
		// check if tutorial is to be shown
		if (!settings.tutorialCompleted) {
			dispatch({
				type: "SET_TUTORIAL_COMPLETED",
				payload: true,
			})
			setTour("home2")
		}
	}

	let [fontsLoaded, error] = useFonts({
		"WorkSans-SemiBold": require("../../../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
		"WorkSans-Regular": require("../../../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
	})

	const modalStyles = StyleSheet.create({
		nomargin: {
			margin: 0,
			color: settings.darkMode ? "white" : "black",
		},
		floatLeft: {
			textAlign: "left",
			alignSelf: "flex-start",
			paddingLeft: 10,
			color: settings.darkMode ? "#9e9e9e" : "black",
		},
		root: {
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			padding: 10,
			paddingTop: 20,
			paddingBottom: 20,
			backgroundColor: settings.darkMode ? "#1e1e1e" : "#f5f5f5",
			color: settings.darkMode ? "#e8e8e8" : "#091e42",
			borderColor: settings.darkMode ? "#616161" : "black",
			borderWidth: 1,
		},
		inputContainer: {
			flexDirection: "row",
			width: "100%",
			marginBottom: 10,
			marginLeft: 0,
			padding: 10,
		},
		input: {
			backgroundColor: settings.darkMode ? "#1e1e1e" : "#f5f5f5",
			borderColor: settings.darkMode ? "#4a4a4a" : "#dfe1e6",
			color: settings.darkMode ? "#dedede" : "#091e42",
			borderRadius: 3,
			borderWidth: 2,
			borderStyle: "solid",
			paddingLeft: 8,
			paddingRight: 8,
			paddingTop: 6,
			paddingBottom: 6,
			height: 36,
			marginRight: 5,
		},
		textarea: {
			backgroundColor: settings.darkMode ? "#1e1e1e" : "#f5f5f5",
			borderColor: settings.darkMode ? "#4a4a4a" : "#dfe1e6",
			color: settings.darkMode ? "#dedede" : "#091e42",
			borderRadius: 3,
			borderWidth: 2,
			borderStyle: "solid",
			paddingLeft: 8,
			paddingRight: 8,
			paddingTop: 6,
			paddingBottom: 6,
			height: 150,
			marginRight: 5,
			textAlignVertical: "top",
		},
		textareaDisabled: {
			backgroundColor: settings.darkMode ? "#1e1e1e" : "#f5f5f5",
			borderColor: settings.darkMode ? "#4a4a4a" : "#dfe1e6",
			color: settings.darkMode ? "#dedede" : "#091e42",
			borderRadius: 3,
			borderWidth: 2,
			borderStyle: "solid",
			paddingLeft: 8,
			paddingRight: 8,
			paddingTop: 6,
			paddingBottom: 6,
			marginRight: 5,
			textAlignVertical: "top",
		},
		buttonContainer: {
			flexDirection: "row",
			justifyContent: "space-between",
			width: "100%",
			paddingLeft: 10,
			paddingRight: 10,
		},
		deleteButton: {
			backgroundColor: settings.darkMode ? "#CC0000" : "#ff4444", // red background
			padding: 10,
			borderRadius: 5,
			width: "45%",
			alignItems: "center",
			color: "white",
		},
		okButtonGuide: {
			width: "45%",
		},
		okButton: {
			backgroundColor: settings.darkMode ? "#007E33" : "#00C851", // green background
			padding: 10,
			width: "100%",
			borderRadius: 5,
			alignItems: "center",
			color: "white",
		},
		buttonText: {
			color: settings.darkMode ? "black" : "white",
			fontWeight: "bold",
			fontSize: 16,
		},
	})

	const screenStyles = StyleSheet.create({
		root: {
			backgroundColor: settings.darkMode ? "#252526" : "white",
		},
		textColor: {
			color: settings.darkMode ? "#e8e8e8" : "black",
		},
		image: {
			tintColor: settings.darkMode ? "#e8e8e8" : "black",
		},
	})

	const {
		start, // a function to start the tourguide
		stop, // a function  to stopping it
		tourKey, // a string to identify the tourguide
	} = useTourGuideController("home")

	const {
		start: startModal, // a function to start the tourguide
		stop: stopModal, // a function  to stopping it
		tourKey: tourKeyModal, // a string to identify the tourguide
	} = useTourGuideController("modal")

	const [tour, setTour] = useState("")

	useEffect(() => {
		if (!settings.tutorialCompleted) {
			setTimeout(() => {
				setTour("home")
			}, 2000)
		}
		if (passwordsData && Object.keys(passwordsData).length > 0) {
			dispatch({
				type: "SET_TUTORIAL_COMPLETED",
				payload: true,
			})
		}
	}, [])

	useEffect(() => {
		if (tour === "home") {
			// console.log("Starting tour...")
			start && start()
		}
		if (tour === "home2") {
			// console.log("Starting tour 2...")
			start && start(1)
		}
		if (tour === "modal") {
			// console.log("Starting modal tour...")
			startModal && startModal()
		}
	}, [tour])

	if (!fontsLoaded) {
		return <AppLoading />
	}
	return (
		<Container style={screenStyles.root}>
			<Modal
				coverScreen={false}
				animationIn={"zoomIn"}
				animationOut={"zoomOut"}
				isVisible={modalVisible}
				onRequestClose={() => {
					setAllFieldsEditMode(false)
					setAddPasswordMode(false)
					setModalVisible(false)
				}}
				style={{ margin: 0, marginLeft: 20, marginRight: 20, zIndex: 1 }}
				onBackdropPress={() => {
					setAllFieldsEditMode(false)
					setAddPasswordMode(false)
					setModalVisible(false)
					stopModal()
				}}>
				<View style={modalStyles.root}>
					<Text style={modalStyles.floatLeft}>
						{addPasswordMode
							? "Add unique Reference"
							: editReferenceMode
							? "Edit reference"
							: "Reference"}
					</Text>
					<TourGuideZone
						zone={0}
						tourKey={tourKeyModal}
						text='Add a unique reference for identification'>
						<View style={modalStyles.inputContainer} id='step2'>
							<TextInput
								style={{
									...modalStyles.input,
									width: addPasswordMode || editReferenceMode ? "100%" : "90%",
								}}
								editable={editReferenceMode}
								onChangeText={(text) => setReference(text)}
								value={reference}
								placeholder='Enter reference text'
								placeholderTextColor={settings.darkMode ? "#828282" : "#a3a3a3"}
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
					</TourGuideZone>
					<Text style={modalStyles.floatLeft}>
						{addPasswordMode
							? "Add Password"
							: editPasswordMode
							? "Edit password"
							: settings.longPressToCopy
							? "Password (tap & hold to see, long press to copy)"
							: "Password (tap and hold to see)"}
					</Text>
					<TourGuideZone
						zone={1}
						tourKey={tourKeyModal}
						text='Add the password here'>
						<View style={modalStyles.inputContainer} id='step3'>
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
									placeholderTextColor={
										settings.darkMode ? "#828282" : "#a3a3a3"
									}
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
					</TourGuideZone>
					<Text style={modalStyles.floatLeft}>
						{addPasswordMode
							? "Add Notes"
							: editNoteMode
							? "Edit notes"
							: "Notes"}
					</Text>
					<TourGuideZone
						zone={2}
						tourKey={tourKeyModal}
						text='Optionally add notes here'>
						<View style={modalStyles.inputContainer} id='step4'>
							{editNoteMode && (
								<TextInput
									style={{
										...modalStyles.textarea,
										width: addPasswordMode || editNoteMode ? "100%" : "90%",
									}}
									editable={editNoteMode}
									onChangeText={(text) => setNote(text)}
									value={note}
									multiline={true}
									placeholder='Enter notes...'
									placeholderTextColor={
										settings.darkMode ? "#828282" : "#a3a3a3"
									}
								/>
							)}
							{!editNoteMode && (
								<View
									style={{
										flex: 1,
										flexGrow: 1,
										...modalStyles.textarea,
									}}>
									<ScrollView
										contentContainerStyle={{
											flexGrow: 1,
										}}>
										<Text
											style={{
												color: settings.darkMode ? "#dedede" : "#091e42",
											}}>
											{note}
										</Text>
									</ScrollView>
								</View>
							)}
							{!addPasswordMode && (
								<TouchableOpacity onPress={toggleNoteEditMode}>
									{!editNoteMode && (
										<ModalButtonImage
											source={require("../../assets/edit.png")}
											style={screenStyles.image}
										/>
									)}
								</TouchableOpacity>
							)}
						</View>
					</TourGuideZone>
					<View style={modalStyles.buttonContainer}>
						<TouchableOpacity
							style={modalStyles.deleteButton}
							onPress={handleDeleteButton}>
							<Text style={modalStyles.buttonText}>
								{editReferenceMode || editPasswordMode ? "Cancel" : "Delete"}
							</Text>
						</TouchableOpacity>
						<TourGuideZone
							zone={3}
							tourKey={tourKeyModal}
							style={modalStyles.okButtonGuide}
							text='Click here to save the password'>
							<TouchableOpacity
								id='step5'
								style={modalStyles.okButton}
								onPress={handleOkSave}>
								<Text style={modalStyles.buttonText}>
									{editReferenceMode || editPasswordMode ? "Save" : "Ok"}
								</Text>
							</TouchableOpacity>
						</TourGuideZone>
					</View>
				</View>
			</Modal>
			<TourGuideZone
				zone={0}
				tourKey={tourKey}
				text='Click here to add a new password'>
				<AddPasswordButton
					onPress={handleAddPassword}
					darkMode={settings.darkMode}
				/>
			</TourGuideZone>
			{Object.keys(passwordsData).length > 0 && (
				<TourGuideZone
					zone={1}
					tourKey={tourKey}
					style={{
						...screenStyles.textColor,
						...screenStyles.root,
						flex: 1,
						width: "100%",
					}}
					text='Your passwords will be listed here with last updated first'>
					<PasswordsList
						data={Object.keys(passwordsData).reverse()}
						renderItem={({ item }) => (
							<PasswordItem
								reference={item}
								onPress={handleViewReferenceModal}
								darkMode={settings.darkMode}
							/>
						)}
						keyExtractor={(item, index) => index.toString()}
					/>
				</TourGuideZone>
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
