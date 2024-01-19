const initialState = {
	passwords: {
		"RIL": "123456",
	},
}

export default (state = initialState, action) => {
	let newState = { ...state.passwords }

	switch (action.type) {
		case "ADD_PASSWORD":
			newState[action.payload.reference] = action.payload.password
			break

		case "EDIT_PASSWORD":
			if (newState[action.payload.old_reference]) {
				newState[action.payload.old_reference] = undefined
			}
			newState[action.payload.reference] = action.payload.password
			break

		case "DELETE_PASSWORD":
			newState[action.payload.reference] = undefined
			break
	}

	return {
		...state,
		passwords: newState,
	}
}
