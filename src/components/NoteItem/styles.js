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
  color: ${(props) => (props.success === true ? "#fff" : "#000")};
  text-decoration: ${(props) =>
    props.success === true ? "line-through" : "none"};
`;

export const Check = styled.TouchableHighlight`
  /* background: red; */
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
`;

export const CheckImage = styled.Image`
  width: 25px;
  height: 25px;
`;

export const UnCheck = styled.TouchableHighlight`
  /* background: red; */
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
`;

export const UnCheckImage = styled.Image`
  width: 25px;
  height: 25px;
`;
