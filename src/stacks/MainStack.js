import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Splash from "../pages/SplashAuth";
import ListScreen from "../pages/ListScreen";
import SettingsScreen from "../pages/SettingsScreen";

const MainStack = createStackNavigator();

export default () => (
  <MainStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: "#fbfbfb",
      },
      headerTintColor: "#222",
    }}
  >
    {/* <MainStack.Screen
      name="Splash"
      component={Splash}
      options={{
        headerShown: false,
      }}
    /> */}
    <MainStack.Screen name="List" component={ListScreen} />
    <MainStack.Screen name="Settings" component={SettingsScreen} />
  </MainStack.Navigator>
);
