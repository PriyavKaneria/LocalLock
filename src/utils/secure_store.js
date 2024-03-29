import * as SecureStore from "expo-secure-store"

// if fetchKeychain fails, try again couple times
const ATTEMPTS_LIMIT = 3

export const getSecureStoreItemAsync = async (key) => {
	let attempts = 0
	while (attempts < ATTEMPTS_LIMIT) {
		try {
			// eslint-disable-next-line no-await-in-loop
			const data = await SecureStore.getItemAsync(key)

			return data
		} catch (err) {
			if (attempts === 0) {
				console.error("Failed to fetch keychain", err)
			}
			attempts += 1
		}
	}
	// reset the keychain if keeps failing
	await resetKeychain(key)
	return undefined
}

export const setSecureStoreItemAsync = async (key, value) => {
	let attempts = 0
	while (attempts < ATTEMPTS_LIMIT) {
		try {
			// eslint-disable-next-line no-await-in-loop
			await SecureStore.setItemAsync(key, value)

			return
		} catch (err) {
			if (attempts === 0) {
				console.error("Failed to set keychain", err)
			}
			attempts += 1
		}
	}
	// reset the keychain if keeps failing
	await resetKeychain(key)
}

const resetKeychain = async (key) => {
	await SecureStore.deleteItemAsync(key)
}
