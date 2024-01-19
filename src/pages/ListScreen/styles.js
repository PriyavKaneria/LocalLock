import styled from "styled-components/native"

export const Container = styled.View`
	flex: 1;
	background-color: #fff;
`

export const AddButton = styled.TouchableHighlight`
	margin-right: 15px;
	padding: 10px;
`

export const AddButtonImage = styled.Image`
	width: 24px;
	height: 24px;
`

export const ModalButtonImage = styled.Image`
	width: 32px;
	height: 32px;
`

export const PasswordsList = styled.FlatList`
	flex: 1;
	width: 100%;
`

export const NoPasswords = styled.View`
	flex: 1;
	justify-content: center;
	align-items: center;
`

export const NoPasswordsImage = styled.Image`
	width: 250px;
	height: 250px;
	margin-bottom: 10px;
`

export const NoPasswordsText = styled.Text`
	font-size: 20px;
	color: #000;
`
