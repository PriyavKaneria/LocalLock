import React from "react";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

export default () => {
  const navigation = useNavigation();

  return (
    <LottieView
      source={require("../../assets/splash.json")}
      autoPlay
      loop={false}
      onAnimationFinish={() => navigation.navigate("List")}
    />
  );
};
