import styled from "styled-components/native";

export const Box = styled.TouchableHighlight`
  padding: 15px;
  background: ${(props) => (props.check === true ? "#6C63FF" : "#f5f9f8")};
  margin: 10px;
  border-radius: 5px;
`;

export const BoxContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.Text`
  font-size: 19px;
  color: #000;
  text-decoration: none;
`;