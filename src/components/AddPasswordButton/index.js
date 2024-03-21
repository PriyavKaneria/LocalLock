import { Box, BoxContainer, Title } from "./styles"

export default AddPasswordButton = ({ onPress, darkMode }) => {
	return (
		<Box
			underlayColor={darkMode ? "#71e39d" : "#dee0e0"}
			style={{
				backgroundColor: darkMode ? "#6be397" : "#f5f5f5",
			}}
			onPress={() => onPress()}>
			<BoxContainer>
				<Title
					style={{
						fontFamily: "WorkSans-SemiBold",
					}}>
					+ Add Password
				</Title>
			</BoxContainer>
		</Box>
	)
}
