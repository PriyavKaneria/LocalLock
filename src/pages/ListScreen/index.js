import { useState, useEffect, useRef, useMemo, useCallback } from "react"
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
	FlatList,
	Platform,
	KeyboardAvoidingView,
} from "react-native"
import { TouchableOpacity as FixedTouchableOpacity } from "react-native-gesture-handler"
import { useNavigation } from "@react-navigation/native"
import { useDispatch, useSelector } from "react-redux"
import Modal from "react-native-modal"
import * as Clipboard from "expo-clipboard"
import * as SplashScreen from "expo-splash-screen"
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

// Predefined category colors
const CATEGORY_COLORS = [
	"#FFB300",
	"#1E88E5",
	"#43A047",
	"#E53935",
	"#8E24AA",
	"#F4511E",
	"#3949AB",
	"#00897B",
	"#6D4C41",
	"#757575",
	"#00ACC1",
	"#C0CA33",
]

function getRandomColor(existingColors) {
	const available = CATEGORY_COLORS.filter((c) => !existingColors.includes(c))
	if (available.length === 0)
		return CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]
	return available[Math.floor(Math.random() * available.length)]
}

SplashScreen.preventAutoHideAsync()

export default () => {
	const navigation = useNavigation()
	const passwordsData = useSelector((state) => state.passwords.passwords)
	const notesData = useSelector((state) => state.passwords.notes)
	const categories = useSelector((state) => state.passwords.categories)
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
	const [categoryInput, setCategoryInput] = useState("")
	const [oldCategoryInput, setOldCategoryInput] = useState("")
	const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false)
	const [search, setSearch] = useState("")
	const [sortOption, setSortOption] = useState(
		settings.sortOption || "lastUpdated"
	)

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
							// start splash screen onboarding
							dispatch({
								type: "SET_ONBOARDING_COMPLETED",
								payload: false,
							})
							navigation.navigate("Splash")
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
							source={require("../../../assets/app/settings.png")}
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
		const subscription = AppState.addEventListener("change", () => {
			handleStateChange(AppState.currentState)
		})

		return () => {
			subscription.remove()
		}
	}, [navigation])

	const handleViewReferenceModal = async (_reference, onlyCopy = false) => {
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
		if (onlyCopy) {
			// Copy password to clipboard
			Clipboard.setStringAsync(decryptedPassword).then(() => {
				// show toast for below android 13
				if (Platform.OS === "android" && Platform.Version < 33) {
					ToastAndroid.show("Password copied to clipboard", ToastAndroid.SHORT)
				}
			})
			return
		}
		setReference(_reference)
		setOldReference(_reference)
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
		setCategoryInput(passwordsData[_reference + "_category"] ?? "")
		setOldCategoryInput(passwordsData[_reference + "_category"] ?? "")
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
		setCategoryInput("")
		setOldCategoryInput("")
		setAllFieldsEditMode(true)
		setModalVisible(true)
	}

	const handleDeleteButton = () => {
		if (
			addPasswordMode ||
			editReferenceMode ||
			editPasswordMode ||
			editNoteMode ||
			categoryInput !== oldCategoryInput
		) {
			setAddPasswordMode(false)
			setAllFieldsEditMode(false)
			setModalVisible(false)
			setCategoryDropdownVisible(false)
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
		const trimmedCategory = categoryInput.trim()
		let finalCategory = ""
		if (trimmedCategory && trimmedCategory !== "") {
			finalCategory = trimmedCategory
			// Check if category already exists
			if (categories && !categories[trimmedCategory]) {
				const color = getRandomColor(
					Object.values(categories).map((c) => c.color)
				)
				dispatch({
					type: "ADD_CATEGORY",
					payload: { name: trimmedCategory, color },
				})
			}
		}
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
					category: finalCategory,
				},
			})
		} else if (
			editReferenceMode ||
			editPasswordMode ||
			editNoteMode ||
			categoryInput !== oldCategoryInput
		) {
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
					category: finalCategory,
				},
			})
		}
		setAllFieldsEditMode(false)
		setAddPasswordMode(false)
		setModalVisible(false)
		setCategoryDropdownVisible(false)
		setCategoryInput("")
		setOldCategoryInput("")
	}

	let [fontsLoaded, error] = useFonts({
		"WorkSans-SemiBold": require("../../../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
		"WorkSans-Regular": require("../../../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
	})

	const modalStyles = StyleSheet.create({
		nomargin: {
			margin: 0,
			backgroundColor: settings.darkMode ? "#1e1e1e" : "#f5f5f5",
			color: settings.darkMode ? "#dedede" : "#091e42",
			borderRadius: 3,
			paddingLeft: 8,
			paddingRight: 8,
			paddingTop: 6,
			paddingBottom: 6,
			height: 36,
			marginRight: 5,
		},
		floatLeft: {
			textAlign: "left",
			alignSelf: "flex-start",
			paddingLeft: 10,
			color: settings.darkMode ? "#9e9e9e" : "black",
		},
		root: {
			flexDirection: "column",
			padding: 10,
			paddingTop: 20,
			paddingBottom: 20,
			backgroundColor: settings.darkMode ? "#1e1e1e" : "#f5f5f5",
			color: settings.darkMode ? "#e8e8e8" : "#091e42",
			borderColor: settings.darkMode ? "#616161" : "black",
			borderWidth: 1,
			height: "auto",
			maxHeight: 550,
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
		okButton: {
			backgroundColor: settings.darkMode ? "#007E33" : "#00C851", // green background
			padding: 10,
			width: "45%",
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

	useEffect(() => {
		if (passwordsData && Object.keys(passwordsData).length > 0) {
			dispatch({
				type: "SET_ONBOARDING_COMPLETED",
				payload: true,
			})
		}
	}, [])

	const handleCategoryInputChange = (text) => {
		setCategoryInput(text)
		if (text === "") {
			setCategoryDropdownVisible(false)
		} else {
			setCategoryDropdownVisible(true)
		}
	}

	// Category dropdown logic
	const categorySuggestions = useMemo(
		() =>
			Object.keys(categories || {}).filter(
				(cat) =>
					cat.toLowerCase().includes(categoryInput.toLowerCase()) && cat !== ""
			),
		[categories, categoryInput]
	)

	const showNewCategoryHint = useMemo(() => {
		return (
			categoryInput &&
			!categorySuggestions.includes(categoryInput) &&
			categoryInput !== ""
		)
	}, [categoryInput, categorySuggestions])

	// Search and sort logic
	const getPasswordList = () => {
		let list = Object.keys(passwordsData)
		// Remove _category keys
		list = list.filter((k) => !k.endsWith("_category"))
		if (search) {
			list = list.filter((ref) =>
				ref.toLowerCase().includes(search.toLowerCase())
			)
		}
		if (sortOption === "alphabetical") {
			list = list.sort((a, b) => a.localeCompare(b))
		} else if (sortOption === "category") {
			list = list.sort((a, b) => {
				const catA = passwordsData[a + "_category"] || ""
				const catB = passwordsData[b + "_category"] || ""
				if (catA === catB) return a.localeCompare(b)
				return catA.localeCompare(catB)
			})
		} else {
			// lastUpdated: keep reverse order (default)
			list = list.reverse()
		}
		return list
	}

	const handleSortChange = (option) => {
		setSortOption(option)
		dispatch({ type: "SET_SORT_OPTION", payload: option })
	}

	const onLayoutRootView = useCallback(async () => {
		await SplashScreen.hideAsync()
	})

	if (!fontsLoaded) {
		return null
	}

	return (
		<Container style={screenStyles.root} onLayout={onLayoutRootView}>
			{/* Search and Sort Bar */}
			<View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						alignItems: "center",
						backgroundColor: settings.darkMode ? "#1e1e1e" : "#f5f5f5",
						borderRadius: 5,
						borderWidth: 1,
						borderColor: settings.darkMode ? "#616161" : "#dfe1e6",
						marginRight: 10,
					}}>
					<TextInput
						style={{
							flex: 1,
							color: settings.darkMode ? "#dedede" : "#091e42",
							padding: 12,
						}}
						placeholder='Search by title...'
						placeholderTextColor={settings.darkMode ? "#828282" : "#a3a3a3"}
						value={search}
						onChangeText={setSearch}
					/>
					{search.length > 0 && (
						<TouchableOpacity onPress={() => setSearch("")}>
							<Text
								style={{
									fontSize: 18,
									color: settings.darkMode ? "#dedede" : "#091e42",
									paddingHorizontal: 8,
								}}>
								×
							</Text>
						</TouchableOpacity>
					)}
				</View>
				<View style={{ minWidth: 120 }}>
					<TouchableOpacity
						style={{
							borderWidth: 1,
							borderColor: settings.darkMode ? "#616161" : "#dfe1e6",
							borderRadius: 5,
							padding: 8,
							paddingVertical: 12,
							backgroundColor: settings.darkMode ? "#1e1e1e" : "#f5f5f5",
						}}
						onPress={() =>
							handleSortChange(
								sortOption === "lastUpdated"
									? "alphabetical"
									: sortOption === "alphabetical"
									? "category"
									: "lastUpdated"
							)
						}>
						<Text style={{ color: settings.darkMode ? "#dedede" : "#091e42" }}>
							Sort:{" "}
							{sortOption === "lastUpdated"
								? "Last Updated"
								: sortOption === "alphabetical"
								? "A-Z"
								: "Category"}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
			<Modal
				coverScreen={false}
				animationIn={"zoomIn"}
				animationOut={"zoomOut"}
				isVisible={modalVisible}
				onRequestClose={() => {
					setAllFieldsEditMode(false)
					setAddPasswordMode(false)
					setModalVisible(false)
					setCategoryDropdownVisible(false)
				}}
				style={{ margin: 0, marginLeft: 20, marginRight: 20, zIndex: 1 }}
				onBackdropPress={() => {
					setAllFieldsEditMode(false)
					setAddPasswordMode(false)
					setModalVisible(false)
					setCategoryDropdownVisible(false)
				}}>
				<KeyboardAvoidingView behavior='position'>
					<ScrollView
						nestedScrollEnabled={true}
						style={modalStyles.root}
						contentContainerStyle={{
							paddingBottom: 50,
						}}>
						<Text style={modalStyles.floatLeft}>
							{addPasswordMode
								? "Add id/title"
								: editReferenceMode
								? "Edit id/title"
								: "Reference"}
						</Text>
						<View style={modalStyles.inputContainer} id='step2'>
							<TextInput
								style={{
									...modalStyles.input,
									width: addPasswordMode || editReferenceMode ? "100%" : "90%",
								}}
								editable={editReferenceMode}
								onChangeText={(text) => setReference(text)}
								value={reference}
								placeholder='Enter id/title'
								placeholderTextColor={settings.darkMode ? "#828282" : "#a3a3a3"}
							/>
							{!addPasswordMode && (
								<TouchableOpacity onPress={toggleReferenceEditMode}>
									{!editReferenceMode && (
										<ModalButtonImage
											source={require("../../../assets/app/edit.png")}
											style={screenStyles.image}
										/>
									)}
								</TouchableOpacity>
							)}
						</View>
						<Text style={modalStyles.floatLeft}>
							{addPasswordMode
								? "Add Password"
								: editPasswordMode
								? "Edit password"
								: settings.longPressToCopy
								? "Password (tap & hold to see, long press to copy)"
								: "Password (tap and hold to see)"}
						</Text>
						<View style={modalStyles.inputContainer} id='step3'>
							{editPasswordMode ? (
								<TextInput
									style={{
										...modalStyles.input,
										width: addPasswordMode || editPasswordMode ? "100%" : "90%",
									}}
									editable={editPasswordMode}
									onChangeText={(text) => setPassword(text)}
									value={password}
									placeholder='Enter password'
									placeholderTextColor={
										settings.darkMode ? "#828282" : "#a3a3a3"
									}
									secureTextEntry={!editPasswordMode && !passwordVisible}
								/>
							) : (
								<TouchableOpacity
									onPressIn={() => setPasswordVisible(true)}
									onPressOut={() => setPasswordVisible(false)}
									onLongPress={() => {
										if (!editPasswordMode && settings.longPressToCopy) {
											// copy password to clipboard
											Clipboard.setStringAsync(password).then(() => {
												// show toast for below android 13
												if (
													Platform.OS === "android" &&
													Platform.Version < 33
												) {
													ToastAndroid.show(
														"Password copied to clipboard",
														ToastAndroid.SHORT
													)
												}
											})
										}
									}}
									activeOpacity={1}
									style={{
										width: "90%",
									}}>
									<TextInput
										pointerEvents='none'
										style={modalStyles.input}
										value={password}
										editable={false}
										secureTextEntry={!editPasswordMode && !passwordVisible}
									/>
								</TouchableOpacity>
							)}

							{!addPasswordMode && (
								<TouchableOpacity onPress={togglePasswordEditMode}>
									{!editPasswordMode && (
										<ModalButtonImage
											source={require("../../../assets/app/edit.png")}
											style={screenStyles.image}
										/>
									)}
								</TouchableOpacity>
							)}
						</View>
						<Text style={modalStyles.floatLeft}>
							{addPasswordMode
								? "Add Notes"
								: editNoteMode
								? "Edit notes"
								: "Notes"}
						</Text>
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
											source={require("../../../assets/app/edit.png")}
											style={screenStyles.image}
										/>
									)}
								</TouchableOpacity>
							)}
						</View>
						{/* Category Input */}
						<Text style={modalStyles.floatLeft}>Category</Text>
						<View
							style={{
								...modalStyles.inputContainer,
								flexDirection: "column",
							}}>
							<TextInput
								style={{ ...modalStyles.input, width: "100%" }}
								value={categoryInput}
								onFocus={() => setCategoryDropdownVisible(true)}
								onBlur={() =>
									setTimeout(() => setCategoryDropdownVisible(false), 200)
								}
								onChangeText={handleCategoryInputChange}
								placeholder='Select or type category'
								placeholderTextColor={settings.darkMode ? "#828282" : "#a3a3a3"}
							/>
							{showNewCategoryHint && (
								<Text
									style={{
										color: "#43A047",
										fontSize: 12,
										alignSelf: "flex-start",
									}}>
									New category will be created
								</Text>
							)}
							{categoryDropdownVisible && categorySuggestions.length > 0 && (
								<ScrollView
									nestedScrollEnabled={true}
									keyboardShouldPersistTaps='never'
									style={{
										position: "absolute",
										bottom: 50,
										left: 0,
										right: 0,
										backgroundColor: settings.darkMode ? "#222" : "#fff",
										borderWidth: 1,
										borderColor: settings.darkMode ? "#616161" : "#dfe1e6",
										zIndex: 10,
										borderRadius: 5,
										height: Math.min(150, categorySuggestions.length * 40),
									}}>
									{categorySuggestions.map((cat) => (
										<FixedTouchableOpacity
											key={cat}
											onPress={() => {
												setCategoryInput(cat)
												setCategoryDropdownVisible(false)
											}}>
											<Text
												style={{
													padding: 10,
													color: settings.darkMode ? "#dedede" : "#091e42",
												}}>
												{cat}
											</Text>
										</FixedTouchableOpacity>
									))}
								</ScrollView>
							)}
						</View>
						<View style={modalStyles.buttonContainer}>
							<TouchableOpacity
								style={modalStyles.deleteButton}
								onPress={handleDeleteButton}>
								<Text style={modalStyles.buttonText}>
									{editReferenceMode ||
									editPasswordMode ||
									editNoteMode ||
									categoryInput !== oldCategoryInput
										? "Cancel"
										: "Delete"}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								id='step5'
								style={modalStyles.okButton}
								onPress={handleOkSave}>
								<Text style={modalStyles.buttonText}>
									{editReferenceMode ||
									editPasswordMode ||
									editNoteMode ||
									categoryInput !== oldCategoryInput
										? "Save"
										: "Ok"}
								</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</Modal>
			<AddPasswordButton
				onPress={handleAddPassword}
				darkMode={settings.darkMode}
			/>
			{getPasswordList().length > 0 && (
				<PasswordsList
					data={getPasswordList()}
					renderItem={({ item }) => (
						<PasswordItem
							reference={item}
							category={passwordsData[item + "_category"]}
							categoryColor={
								categories[passwordsData[item + "_category"]]?.color
							}
							onPress={handleViewReferenceModal}
							onLongPress={(_reference) =>
								handleViewReferenceModal(_reference, (onlyCopy = true))
							}
							darkMode={settings.darkMode}
						/>
					)}
					keyExtractor={(item, index) => index.toString()}
				/>
			)}
			{getPasswordList().length === 0 && (
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
