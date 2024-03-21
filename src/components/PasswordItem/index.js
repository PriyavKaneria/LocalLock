import { Box, BoxContainer, Title } from "./styles"

export default PasswordItem = ({ reference, onPress, darkMode }) => {
	return (
		<Box
			underlayColor={darkMode ? "#252526" : "#dee0e0"}
			style={{
				backgroundColor: darkMode ? "#2d2d30" : "#f5f9f8",
			}}
			onPress={() => onPress(reference)}>
			<BoxContainer>
				<Title
					style={{
						fontFamily: "WorkSans-SemiBold",
						color: darkMode ? "#fbfbfb" : "#000000",
					}}>
					{reference}
				</Title>
			</BoxContainer>
		</Box>
	)
}
