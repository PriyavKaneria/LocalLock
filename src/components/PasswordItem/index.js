import { Box, BoxContainer, Title } from "./styles"

export default PasswordItem = ({ reference, onPress, darkMode }) => {
	return (
		<Box
			underlayColor={darkMode ? "#71e39d" : "#dee0e0"}
			style={{
				backgroundColor: darkMode ? "#5bbd80" : "#f5f9f8",
			}}
			onPress={() => onPress(reference)}>
			<BoxContainer>
				<Title
					style={{
						fontFamily: "WorkSans-SemiBold",
					}}>
					{reference}
				</Title>
			</BoxContainer>
		</Box>
	)
}
