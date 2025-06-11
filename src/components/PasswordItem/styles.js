import styled from "styled-components/native"

export const Box = styled.TouchableHighlight`
	padding: 15px;
	margin: 10px;
	border-radius: 5px;
`

export const BoxContainer = styled.View`
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`

export const Title = styled.Text`
	font-size: 19px;
	text-decoration: none;
`

export const CategoryBadge = styled.View`
	padding: 3px 10px;
	border-radius: 10px;
	margin-left: 10px;
	align-self: center;
`

export const CategoryText = styled.Text`
	font-size: 13px;
	color: #fff;
`
