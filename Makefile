run start:
	yarn start

build:
	yarn eas build -p android --profile production

build-preview:
	yarn eas build -p android --profile preview