import React from "react";
import {
  Box,
  BoxContainer,
  Title,
  Check,
  CheckImage,
  UnCheck,
  UnCheckImage,
} from "./styles";

import { useDispatch } from "react-redux";

export default ({ data, index, onPress }) => {
  const dispatch = useDispatch();

  const handleCheckNote = () => {
    dispatch({
      type: "SUCCESS_NOTE",
      payload: {
        key: index,
        title: data.title,
        body: data.body,
      },
    });
  };

  const handleUnCheckNote = () => {
    dispatch({
      type: "UNCHECK_NOTE",
      payload: {
        key: index,
        title: data.title,
        body: data.body,
      },
    });
  };

  return (
    <Box
      onPress={() => onPress(index)}
      underlayColor={data.done ? "#0000ff" : "#fff"}
      check={data.done}
    >
      <BoxContainer>
        <Title
          style={{
            fontFamily: "WorkSans-SemiBold",
          }}
          success={data.done}
        >
          {data.title}
        </Title>
        {data.done !== true && (
          <Check onPress={handleCheckNote} underlayColor="transparent">
            <CheckImage source={require("../../assets/check.png")} />
          </Check>
        )}
        {data.done !== false && (
          <UnCheck onPress={handleUnCheckNote} underlayColor="transparent">
            <UnCheckImage source={require("../../assets/nocheck.png")} />
          </UnCheck>
        )}
      </BoxContainer>
    </Box>
  );
};
