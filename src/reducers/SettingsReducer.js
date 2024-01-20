const initialState = {
	settings: {
		allowNonBiometric: false,
		longPressToCopy: false,
	},
}

export default (state = initialState, action) => {
	let newState = { ...state.settings }

	switch (action.type) {
		case "SET_ALLOW_NON_BIOMETRIC":
			newState.allowNonBiometric = action.payload
			break

		case "SET_LONG_PRESS_TO_COPY":
			newState.longPressToCopy = action.payload
			break
	}

	return {
		...state,
		settings: newState,
	}
}