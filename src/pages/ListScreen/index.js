import { useState, useEffect, useLayoutEffect } from "react"
import {
	BackHandler,
	View,
	TouchableOpacity,
	TextInput,
	Text,
	StyleSheet,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
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

export default () => {
	const navigation = useNavigation()
	const passwordsData = useSelector((state) => state.passwords.passwords)
	const [modalVisible, setModalVisible] = useState(false)

	const [isEditMode, setEditMode] = useState(false)
	const [reference, setReference] = useState("")
	const [password, setPassword] = useState("")
	const [passwordVisible, setPasswordVisible] = useState(false)

	const toggleEditMode = () => {
		setEditMode(!isEditMode)
	}

	useEffect(() => {
		BackHandler.addEventListener("hardwareBackPress", () => true)
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

	const handleViewPassword = (reference) => {
		setReference(reference)
		setPassword(passwordsData[reference])
		setModalVisible(true)
	}

	const handleOkSave = () => {
		if (isEditMode) {
			// save password
		}
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
				isVisible={modalVisible}
				style={{ margin: 0, marginLeft: 10, marginRight: 10 }}>
				<View style={modalStyles.root}>
					<Text style={modalStyles.floatLeft}>
						{isEditMode ? "Edit reference" : "Reference"}
					</Text>
					<View style={modalStyles.inputContainer}>
						<TextInput
							style={modalStyles.input}
							editable={isEditMode}
							onChangeText={(text) => setReference(text)}
							value={reference}
							placeholder='Reference'
						/>
						<TouchableOpacity onPress={toggleEditMode}>
							<ModalButtonImage source={require("../../assets/edit.png")} />
						</TouchableOpacity>
					</View>
					<Text style={modalStyles.floatLeft}>
						{isEditMode ? "Edit password" : "Password"}
						{passwordVisible && " (hold to see and long press to copy)"}
					</Text>
					<TouchableOpacity
						onPressIn={() => setPasswordVisible(true)}
						onPressOut={() => setPasswordVisible(false)}
						onLongPress={() => {
							// copy password to clipboard
							Clipboard.setString(password)
						}}
						style={modalStyles.nomargin}>
						<View style={modalStyles.inputContainer}>
							<TextInput
								style={modalStyles.input}
								editable={isEditMode}
								onChangeText={(text) => setPassword(text)}
								value={password}
								placeholder='Password'
								secureTextEntry={!passwordVisible}
							/>
							<TouchableOpacity onPress={toggleEditMode}>
								<ModalButtonImage source={require("../../assets/edit.png")} />
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
					<View style={modalStyles.buttonContainer}>
						<TouchableOpacity
							style={modalStyles.deleteButton}
							onPress={() => {}}>
							<Text style={modalStyles.buttonText}>Delete</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={modalStyles.okButton}
							onPress={handleOkSave}>
							<Text style={modalStyles.buttonText}>
								{isEditMode ? "Save" : "Ok"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
			<AddPasswordButton onPress={() => {}}></AddPasswordButton>
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
		width: "90%",
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
