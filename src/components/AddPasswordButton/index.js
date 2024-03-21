import { Box, BoxContainer, Title } from "./styles"

export default AddPasswordButton = ({ onPress, darkMode }) => {
	return (
		<Box
			underlayColor={darkMode ? "#2d2d30" : "#dee0e0"}
			style={{
				backgroundColor: darkMode ? "#3e3e42" : "#f5f5f5",
			}}
			onPress={() => onPress()}>
			<BoxContainer>
				<Title
					style={{
						fontFamily: "WorkSans-SemiBold",
						color: darkMode ? "#fbfbfb" : "#000000",
					}}>
					+ Add Password
				</Title>
			</BoxContainer>
		</Box>
	)
}
