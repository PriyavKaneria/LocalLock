const initialState = {
	passwords: {},
	notes: {},
}

export default (state = initialState, action) => {
	let newPasswordState = { ...state.passwords }
	let newNoteState = { ...state.notes }

	switch (action.type) {
		case "ADD_PASSWORD":
			newPasswordState[action.payload.reference] = action.payload.password
			newNoteState[action.payload.reference] = action.payload.note
			break

		case "EDIT_PASSWORD":
			if (newPasswordState[action.payload.old_reference]) {
				delete newPasswordState[action.payload.old_reference]
				delete newNoteState[action.payload.old_reference]
			}
			newPasswordState[action.payload.reference] = action.payload.password
			newNoteState[action.payload.reference] = action.payload.note
			break

		case "DELETE_PASSWORD":
			delete newPasswordState[action.payload.reference]
			delete newNoteState[action.payload.reference]
			break

		case "INITIALIZE_NOTE":
			newNoteState[action.payload.reference] = ""
			break

		case "SET_STATE_PASSWORDS":
			newPasswordState = action.payload.passwords
			newNoteState = action.payload.notes
			break

		default:
			return state
	}

	return {
		...state,
		passwords: newPasswordState,
		notes: newNoteState,
	}
}
