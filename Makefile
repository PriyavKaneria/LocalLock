run start:
	yarn start

build:
	eas build -p android --profile production

build-preview:
	eas build -p android --profile preview