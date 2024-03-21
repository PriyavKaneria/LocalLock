import { useNavigation, useIsFocused } from "@react-navigation/native"
import LottieView from "lottie-react-native"
import { useState, useEffect, useRef } from "react"
import {
	StyleSheet,
	BackHandler,
	ToastAndroid,
	Animated,
	TouchableOpacity,
	View,
	Text,
	Alert,
} from "react-native"
import AppLoading from "expo-app-loading"
import { useFonts } from "expo-font"
import * as LocalAuthentication from "expo-local-authentication"
import { useSelector } from "react-redux"
import * as Crypto from "expo-crypto"
import SmoothPinCodeInput from "react-native-smooth-pincode-input"
import * as SecureStore from "expo-secure-store"

export default () => {
	const [facialRecognitionAvailable, setFacialRecognitionAvailable] =
		useState(false)
	const [fingerprintAvailable, setFingerprintAvailable] = useState(false)
	const [irisAvailable, setIrisAvailable] = useState(false)
	const [checking, setChecking] = useState(true)
	const [loading, setLoading] = useState(false)
	const [authenticated, setAuthenticated] = useState(false)
	const navigation = useNavigation()
	const animationProgress = useRef(new Animated.Value(0))
	const settings = useSelector((state) => state.settings.settings)
	const isFocused = useIsFocused()
	const [isPinSet, setIsPinSet] = useState(false)

	const [pin, setPin] = useState("")

	const checkSupportedAuthentication = async () => {
		const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
		if (types && types.length) {
			setFacialRecognitionAvailable(
				types.includes(
					LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
				)
			)
			setFingerprintAvailable(
				types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
			)
			setIrisAvailable(
				types.includes(LocalAuthentication.AuthenticationType.IRIS)
			)
			setChecking(false)
		}
	}

	const authenticate = async () => {
		if (loading) {
			return
		}
		setLoading(true)
		try {
			const results = await LocalAuthentication.authenticateAsync({
				disableDeviceFallback: settings.allowNonBiometric ? false : true,
				cancelLabel: "Cancel",
			})

			if (results.success) {
				ToastAndroid.show(
					"Biometric authentication successful",
					ToastAndroid.SHORT
				)
				const pinHash = await SecureStore.getItemAsync("pinHash")
				if (!pinHash) {
					ToastAndroid.show(
						"Please set a PIN for future use",
						ToastAndroid.SHORT
					)
					setLoading(false)
					return
				}
				setAuthenticated(true)
				if (settings.quickBoot) {
					navigation.navigate("List")
				} else {
					Animated.timing(animationProgress.current, {
						toValue: 0.2,
						duration: 2000,
						useNativeDriver: false,
					}).start(() => navigation.navigate("List"))
				}
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
				const pinHash = await SecureStore.getItemAsync("pinHash")
				if (!pinHash) {
					ToastAndroid.show(
						"Biometric authentication to set new PIN is required",
						ToastAndroid.SHORT
					)
					BackHandler.exitApp()
				}
			}
		} catch (error) {
			ToastAndroid.show(
				"There was an error in authentication",
				ToastAndroid.LONG
			)
			BackHandler.exitApp()
		}
		setLoading(false)
	}

	useEffect(() => {
		animationProgress.current.resetAnimation()
		const backHandler = BackHandler.addEventListener("hardwareBackPress", () =>
			BackHandler.exitApp()
		)
		checkSupportedAuthentication()
		Animated.timing(animationProgress.current, {
			toValue: 1,
			duration: 3500,
			useNativeDriver: false,
		}).start()
		return () => backHandler.remove()
	}, [])

	useEffect(() => {
		setAuthenticated(false)
		if (isFocused) {
			animationProgress.current.resetAnimation()
			Animated.timing(animationProgress.current, {
				toValue: 1,
				duration: 3500,
				useNativeDriver: false,
			}).start(() => {
				if (!checking && !loading && !authenticated) authenticate()
			})
		}
	}, [isFocused])

	useEffect(() => {
		if (!checking && !loading && !authenticated) authenticate()
	}, [checking])

	useEffect(() => {
		async function checkPin() {
			const pinHash = await SecureStore.getItemAsync("pinHash")
			if (pinHash) {
				setIsPinSet(true)
			}
		}
		checkPin()
	}, [])

	const handlePinInput = async (text) => {
		setPin(text)
		if (text.length === 4) {
			const inputPinHash = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				text
			)
			setPin("")
			const pinHash = await SecureStore.getItemAsync("pinHash")
			if (!pinHash) {
				Alert.alert("Set PIN", "Would you like to set this PIN?", [
					{
						text: "No",
						onPress: () => {
							setPin("")
							return
						},
					},
					{
						text: "Yes",
						onPress: async () => {
							await SecureStore.setItemAsync("pinHash", inputPinHash)
							navigation.navigate("List")
						},
					},
				])
			} else if (inputPinHash === pinHash) {
				navigation.navigate("List")
			} else {
				ToastAndroid.show("Incorrect PIN", ToastAndroid.SHORT)
				setPin("")
			}
		}
	}

	if (
		!checking &&
		!facialRecognitionAvailable &&
		!fingerprintAvailable &&
		!irisAvailable
	) {
		ToastAndroid.show(
			"Biometric authentication disabled. Please enable it in your device settings.",
			ToastAndroid.LONG
		)
		BackHandler.exitApp()
	}

	let [fontsLoaded, error] = useFonts({
		"WorkSans-SemiBold": require("../../../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
		"WorkSans-Regular": require("../../../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
	})

	if (!fontsLoaded) {
		return <AppLoading />
	}

	const styles = StyleSheet.create({
		main: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: settings.darkMode ? "#252526" : "white",
		},
		animation: {
			width: 400,
			height: 400,
		},
		biometricsButton: {
			marginTop: 20,
		},
		inputContainer: {
			marginBottom: 20,
		},
		inputLabel: {
			fontFamily: "WorkSans-SemiBold",
			fontSize: 20,
			marginBottom: 10,
			color: settings.darkMode ? "#fbfbfb" : "#000000",
		},
		input: {
			fontFamily: "WorkSans-Regular",
			fontSize: 20,
			padding: 10,
			borderWidth: 1,
			borderColor: settings.darkMode ? "#fbfbfb" : "#000000",
			borderRadius: 5,
			width: 200,
		},
		buttonText: {
			fontFamily: "WorkSans-SemiBold",
			fontSize: 20,
			padding: 10,
			borderWidth: 1,
			borderColor: settings.darkMode ? "#fbfbfb" : "#000000",
			borderRadius: 5,
			width: 200,
			textAlign: "center",
			color: settings.darkMode ? "#fbfbfb" : "#000000",
		},
	})

	return (
		<View style={styles.main}>
			<LottieView
				source={require("../../assets/splash.json")}
				progress={animationProgress.current}
				style={styles.animation}
			/>
			{/* Input with label to enter PIN */}
			<View style={styles.inputContainer}>
				<Text style={styles.inputLabel}>
					{isPinSet ? "Enter PIN" : "Set PIN"}
				</Text>
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
					value={pin}
					password
					onTextChange={(text) => handlePinInput(text)}
				/>
				{/* Button to authenticate with biometrics */}
				<TouchableOpacity
					onPress={() => authenticate()}
					style={styles.biometricsButton}>
					<Text style={styles.buttonText}>Use Biometrics</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
