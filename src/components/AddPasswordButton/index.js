import { useEffect, useRef } from "react"
import { Box, BoxContainer, Title } from "./styles"

export default AddPasswordButton = ({ onPress, darkMode }) => {
	const ref = useRef(null)

	useEffect(() => {
		if (ref) {
			global.step1 = ref.current
		}
	}, [])

	return (
		<Box
			underlayColor={darkMode ? "#2d2d30" : "#dee0e0"}
			style={{
				backgroundColor: darkMode ? "#3e3e42" : "#f5f5f5",
			}}
			ref={ref}
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
