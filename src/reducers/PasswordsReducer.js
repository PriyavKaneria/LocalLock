const initialState = {
	passwords: {},
}

export default (state = initialState, action) => {
	let newState = { ...state.passwords }

	switch (action.type) {
		case "ADD_PASSWORD":
			newState[action.payload.reference] = action.payload.password
			break

		case "EDIT_PASSWORD":
			if (newState[action.payload.old_reference]) {
				delete newState[action.payload.old_reference]
			}
			newState[action.payload.reference] = action.payload.password
			break

		case "DELETE_PASSWORD":
			delete newState[action.payload.reference]
			break
	}

	return {
		...state,
		passwords: newState,
	}
}
