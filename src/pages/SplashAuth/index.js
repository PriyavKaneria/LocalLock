import { useNavigation } from "@react-navigation/native"
import LottieView from "lottie-react-native"
import { useState, useEffect, useRef } from "react"
import { BackHandler, ToastAndroid, Animated } from "react-native"
import AppLoading from "expo-app-loading"
import { useFonts } from "expo-font"
import * as LocalAuthentication from "expo-local-authentication"
import { log } from "react-native-reanimated"

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
			const results = await LocalAuthentication.authenticateAsync()

			if (results.success) {
				ToastAndroid.show(
					"Biometric authentication successful",
					ToastAndroid.SHORT
				)
				Animated.timing(animationProgress.current, {
					toValue: 0,
					duration: 2000,
					useNativeDriver: false,
				}).start(() => navigation.navigate("List"))
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
				ToastAndroid.show(
					"Authentication required to open app",
					ToastAndroid.SHORT
				)
				BackHandler.exitApp()
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
		BackHandler.addEventListener("hardwareBackPress", () => true)
		checkSupportedAuthentication()
		Animated.timing(animationProgress.current, {
			toValue: 1,
			duration: 2000,
			useNativeDriver: false,
		}).start(() => authenticate())
	}, [])

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
		<LottieView
			source={require("../../assets/splash.json")}
			progress={animationProgress.current}
			loop={false}
		/>
	)
}
