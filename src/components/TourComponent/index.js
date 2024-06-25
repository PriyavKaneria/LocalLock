import React, {
	useState,
	useCallback,
	useEffect,
	createContext,
	useContext,
} from "react"
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	findNodeHandle,
} from "react-native"
import MaskedView from "@react-native-masked-view/masked-view"
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

const TourContext = createContext(null)

export const TourProvider = ({ children, steps }) => {
	const [currentStep, setCurrentStep] = useState(0)
	const [isTourActive, setIsTourActive] = useState(false)
	const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })

	const opacity = useSharedValue(0)
	const animatedStyles = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
		}
	})

	const startTour = useCallback(() => {
		setCurrentStep(0)
		setIsTourActive(true)
		opacity.value = withTiming(1, { duration: 300 })
	}, [opacity])

	const endTour = useCallback(() => {
		opacity.value = withTiming(0, { duration: 300 }, () => {
			runOnJS(setIsTourActive)(false)
		})
	}, [opacity])

	const nextStep = useCallback(() => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1)
		} else {
			endTour()
		}
	}, [currentStep, steps.length, endTour])

	useEffect(() => {
		if (isTourActive) {
			const { selector } = steps[currentStep]
			const node = findNodeHandle(global[selector])
			console.log("node found", node)
			if (node) {
				global[selector].measureInWindow((x, y, width, height) => {
					setLayout({
						x: x - 20,
						y: y - 20,
						width: width + 40,
						height: height + 40,
					})
				})
			}
		}
	}, [currentStep, isTourActive, steps])

	const renderTourStep = () => {
		if (!isTourActive) return null

		const { content } = steps[currentStep]

		const maskElement = (
			<View style={StyleSheet.absoluteFill}>
				<View style={[styles.mask, layout]} />
			</View>
		)

		return (
			<Animated.View style={[styles.container, animatedStyles]}>
				<MaskedView style={StyleSheet.absoluteFill} maskElement={maskElement}>
					<View style={styles.overlay} />
				</MaskedView>
				<View
					style={[
						styles.contentContainer,
						{ top: layout.y + layout.height + 10 },
					]}>
					<Text style={styles.content}>{content}</Text>
					<TouchableOpacity style={styles.button} onPress={nextStep}>
						<Text style={styles.buttonText}>
							{currentStep === steps.length - 1 ? "Finish" : "Next"}
						</Text>
					</TouchableOpacity>
				</View>
			</Animated.View>
		)
	}

	const tourContextValue = {
		startTour,
		endTour,
	}

	return (
		<TourContext.Provider value={tourContextValue}>
			<View style={styles.container}>
				{children}
				{renderTourStep()}
			</View>
		</TourContext.Provider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		zIndex: 999,
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	mask: {
		backgroundColor: "white",
		position: "absolute",
	},
	contentContainer: {
		position: "absolute",
		left: 20,
		right: 20,
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		maxWidth: screenWidth - 40,
	},
	content: {
		fontSize: 16,
		marginBottom: 20,
	},
	button: {
		backgroundColor: "#007AFF",
		padding: 10,
		borderRadius: 5,
		alignSelf: "flex-end",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
	},
})

export const useTour = () => {
	const context = useContext(TourContext)
	if (!context) {
		throw new Error("useTour must be used within a TourProvider")
	}
	return context
}
