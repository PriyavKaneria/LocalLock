import {
	Box,
	BoxContainer,
	Title,
} from "./styles"

export default AddPasswordButton = ({ onPress }) => {
	return (
		<Box underlayColor='#dee0e0' onPress={() => onPress()}>
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
