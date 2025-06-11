const initialState = {
	passwords: {},
	notes: {},
	categories: {}, // { [categoryName]: { color: string } }
}

export default (state = initialState, action) => {
	let newPasswordState = { ...state.passwords }
	let newNoteState = { ...state.notes }
	let newCategories = { ...state.categories }

	switch (action.type) {
		case "ADD_PASSWORD": {
			const { reference, password, note, category } = action.payload
			newPasswordState[reference] = password
			newNoteState[reference] = note
			if (category) {
				newPasswordState[reference + "_category"] = category
			}
			break
		}
		case "EDIT_PASSWORD": {
			const { old_reference, reference, password, note, category } =
				action.payload
			if (newPasswordState[old_reference]) {
				delete newPasswordState[old_reference]
				delete newNoteState[old_reference]
				delete newPasswordState[old_reference + "_category"]
			}
			newPasswordState[reference] = password
			newNoteState[reference] = note
			if (category) {
				newPasswordState[reference + "_category"] = category
			} else {
				delete newPasswordState[reference + "_category"]
			}
			break
		}
		case "DELETE_PASSWORD": {
			const { reference } = action.payload
			delete newPasswordState[reference]
			delete newNoteState[reference]
			delete newPasswordState[reference + "_category"]
			break
		}
		case "INITIALIZE_NOTE": {
			newNoteState[action.payload.reference] = ""
			break
		}
		case "SET_STATE_PASSWORDS": {
			newPasswordState = action.payload.passwords
			newNoteState = action.payload.notes
			newCategories = action.payload.categories || {}
			break
		}
		case "ADD_CATEGORY": {
			const { name, color } = action.payload
			if (!name) break
			newCategories[name] = { color }
			break
		}
		case "DELETE_CATEGORY": {
			const { name } = action.payload
			if (!name) break
			delete newCategories[name]
			// Remove category from all passwords
			Object.keys(newPasswordState).forEach((ref) => {
				if (newPasswordState[ref + "_category"] === name) {
					delete newPasswordState[ref + "_category"]
				}
			})
			break
		}
		default:
			return state
	}

	return {
		...state,
		passwords: newPasswordState,
		notes: newNoteState,
		categories: newCategories,
	}
}
