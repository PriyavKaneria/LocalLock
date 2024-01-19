import {
	Box,
	BoxContainer,
	Title,
} from "./styles"

export default PasswordItem = ({ reference, onPress }) => {
	return (
		<Box onPress={() => onPress(reference)}>
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
