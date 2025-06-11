import { Box, BoxContainer, Title, CategoryBadge, CategoryText } from "./styles"

export default PasswordItem = ({
	reference,
	category,
	categoryColor,
	onPress,
	onLongPress,
	darkMode,
}) => {
	return (
		<Box
			underlayColor={darkMode ? "#252526" : "#dee0e0"}
			style={{
				backgroundColor: darkMode ? "#2d2d30" : "#f5f9f8",
			}}
			onPress={() => onPress(reference)}
			onLongPress={() => onLongPress(reference)}>
			<BoxContainer>
				<Title
					style={{
						fontFamily: "WorkSans-SemiBold",
						color: darkMode ? "#fbfbfb" : "#000000",
					}}>
					{reference}
				</Title>
				{category && category !== "" && (
					<CategoryBadge
						style={{ backgroundColor: categoryColor || "#757575" }}>
						<CategoryText>{category}</CategoryText>
					</CategoryBadge>
				)}
			</BoxContainer>
		</Box>
	)
}
