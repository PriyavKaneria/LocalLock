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
import { useDispatch, useSelector } from "react-redux"
import * as Crypto from "expo-crypto"
import SmoothPinCodeInput from "react-native-smooth-pincode-input"

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView)

export default () => {
	const [facialRecognitionAvailable, setFacialRecognitionAvailable] =
		useState(false)
	const [fingerprintAvailable, setFingerprintAvailable] = useState(false)
	const [irisAvailable, setIrisAvailable] = useState(false)
	const [checking, setChecking] = useState(true)
	const [loading, setLoading] = useState(false)
	const navigation = useNavigation()
	const animationProgress = useRef(new Animated.Value(0))
	const settings = useSelector((state) => state.settings.settings)
	const dispatch = useDispatch()
	const isFocused = useIsFocused()

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
		BackHandler.addEventListener("hardwareBackPress", () =>
			BackHandler.exitApp()
		)
		checkSupportedAuthentication()
		Animated.timing(animationProgress.current, {
			toValue: 1,
			duration: 3500,
			useNativeDriver: false,
		}).start()
	}, [])

	useEffect(() => {
		if (isFocused) {
			animationProgress.current.resetAnimation()
			Animated.timing(animationProgress.current, {
				toValue: 1,
				duration: 3500,
				useNativeDriver: false,
			}).start(() => authenticate())
		}
	}, [isFocused])

	useEffect(() => {
		if (!checking) authenticate()
	}, [checking])

	const handlePinInput = async (text) => {
		setPin(text)
		if (text.length === 4) {
			const inputPinHash = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				text
			)
			setPin("")
			if (settings.pinHash === null) {
				Alert.alert(
					"Set PIN",
					"Would you like to set this PIN for future use?",
					[
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
								dispatch({
									type: "SET_PIN_HASH",
									payload: inputPinHash,
								})
								navigation.navigate("List")
							},
						},
					]
				)
			} else if (settings.pinHash === inputPinHash) {
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
					{settings.pinHash ? "Enter PIN" : "Set PIN"}
				</Text>
				<SmoothPinCodeInput
					cellStyle={{
						borderBottomWidth: 2,
						borderColor: "gray",
					}}
					cellStyleFocused={{
						borderColor: "black",
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

const styles = StyleSheet.create({
	main: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
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
	},
	input: {
		fontFamily: "WorkSans-Regular",
		fontSize: 20,
		padding: 10,
		borderWidth: 1,
		borderColor: "#000000",
		borderRadius: 5,
		width: 200,
	},
	buttonText: {
		fontFamily: "WorkSans-SemiBold",
		fontSize: 20,
		padding: 10,
		borderWidth: 1,
		borderColor: "#000000",
		borderRadius: 5,
		width: 200,
		textAlign: "center",
	},
})
