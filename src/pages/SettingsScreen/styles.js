import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
`;

export const SettingsItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
`;

export const SettingsItemText = styled.Text`
  font-size: 16px;
`;

export const AddButton = styled.TouchableHighlight`
	margin-right: 15px;
	padding: 10px;
`

export const AddButtonImage = styled.Image`
	width: 24px;
	height: 24px;
`
