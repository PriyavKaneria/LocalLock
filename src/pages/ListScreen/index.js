import { useState, useEffect, useLayoutEffect } from "react"
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
import {
	ScrollView,
	TouchableWithoutFeedback,
} from "react-native-gesture-handler"

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
		if (!editReferenceMode) {
			setOldReference(reference)
		}
		setEditReferenceMode(!editReferenceMode)
	}

	const togglePasswordEditMode = () => {
		setEditPasswordMode(!editPasswordMode)
	}

	useEffect(() => {
		BackHandler.addEventListener("hardwareBackPress", () =>
			BackHandler.exitApp()
		)
	}, [])

	useLayoutEffect(() => {
		navigation.setOptions({
			title: "Passwords",
			headerLeft: false,
			headerRight: () => (
				<AddButton
					underlayColor='transparent'
					onPress={() => navigation.navigate("Settings")}>
					<AddButtonImage source={require("../../assets/settings.png")} />
				</AddButton>
			),
		})
	}, [])

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

	const handleViewPassword = (reference) => {
		setReference(reference)
		setPassword(passwordsData[reference])
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
		if (addPasswordMode) {
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

	const handleOkSave = () => {
		if (addPasswordMode) {
			// add password
			dispatch({
				type: "ADD_PASSWORD",
				payload: {
					reference,
					password,
				},
			})
		} else if (editReferenceMode || editPasswordMode) {
			if (reference === "" || password === "") {
				ToastAndroid.show(
					"Reference and password cannot be empty",
					ToastAndroid.SHORT
				)
				return
			}
			// save password
			dispatch({
				type: "EDIT_PASSWORD",
				payload: {
					reference,
					password,
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

	return (
		<Container>
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
								width: addPasswordMode ? "100%" : "90%",
							}}
							editable={editReferenceMode}
							onChangeText={(text) => setReference(text)}
							value={reference}
							placeholder='Enter reference text'
						/>
						{!addPasswordMode && (
							<TouchableOpacity onPress={toggleReferenceEditMode}>
								<ModalButtonImage source={require("../../assets/edit.png")} />
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
								width: addPasswordMode ? "100%" : "90%",
							}}>
							<TextInput
								style={modalStyles.nomargin}
								editable={editPasswordMode}
								onChangeText={(text) => setPassword(text)}
								value={password}
								placeholder='Enter password'
								secureTextEntry={!editPasswordMode && !passwordVisible}
							/>
						</TouchableOpacity>
						{!addPasswordMode && (
							<TouchableOpacity onPress={togglePasswordEditMode}>
								<ModalButtonImage source={require("../../assets/edit.png")} />
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
			<AddPasswordButton onPress={handleAddPassword}></AddPasswordButton>
			{Object.keys(passwordsData).length > 0 && (
				<PasswordsList
					data={Object.keys(passwordsData)}
					renderItem={({ item, _ }) => (
						<PasswordItem reference={item} onPress={handleViewPassword} />
					)}
					keyExtractor={(item, index) => index.toString()}
				/>
			)}
			{Object.keys(passwordsData).length === 0 && (
				<NoPasswords>
					<NoPasswordsText style={{ fontFamily: "WorkSans-SemiBold" }}>
						No passwords saved
					</NoPasswordsText>
				</NoPasswords>
			)}
		</Container>
	)
}

const modalStyles = StyleSheet.create({
	nomargin: {
		margin: 0,
		color: "#091e42",
	},
	floatLeft: {
		textAlign: "left",
		alignSelf: "flex-start",
		paddingLeft: 10,
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
		width: "100%",
		marginBottom: 10,
		marginLeft: 0,
		padding: 10,
	},
	input: {
		backgroundColor: "#f5f5f5",
		borderColor: "#dfe1e6",
		color: "#091e42",
		borderRadius: 3,
		borderWidth: 2,
		borderStyle: "solid",
		fontSize: 14,
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
