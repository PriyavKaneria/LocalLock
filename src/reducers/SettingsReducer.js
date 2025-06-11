const initialState = {
	settings: {
		allowNonBiometric: false,
		longPressToCopy: false,
		quickBoot: false,
		darkMode: false,
		onboardingCompleted: false,
		sortOption: "lastUpdated", // new: save sort option
	},
}

export default (state = initialState, action) => {
	let newState = { ...state.settings }

	switch (action.type) {
		case "SET_ALLOW_NON_BIOMETRIC":
			if (typeof action.payload !== "boolean") {
				throw new Error("Invalid payload type")
			}
			newState.allowNonBiometric = action.payload
			break

		case "SET_LONG_PRESS_TO_COPY":
			if (typeof action.payload !== "boolean") {
				throw new Error("Invalid payload type")
			}
			newState.longPressToCopy = action.payload
			break

		case "SET_QUICK_BOOT":
			if (typeof action.payload !== "boolean") {
				throw new Error("Invalid payload type")
			}
			newState.quickBoot = action.payload
			break

		case "SET_DARK_MODE":
			if (typeof action.payload !== "boolean") {
				throw new Error("Invalid payload type")
			}
			newState.darkMode = action.payload
			break

		case "SET_STATE_SETTINGS":
			newState = action.payload.settings
			break

		case "SET_ONBOARDING_COMPLETED":
			if (typeof action.payload !== "boolean") {
				throw new Error("Invalid payload type")
			}
			newState.onboardingCompleted = action.payload
			break

		case "SET_SORT_OPTION":
			if (typeof action.payload !== "string") {
				throw new Error("Invalid payload type")
			}
			newState.sortOption = action.payload
			break

		default:
			return state
	}

	return {
		...state,
		settings: newState,
	}
}
