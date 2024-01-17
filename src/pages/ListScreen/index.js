import React, { useEffect, useLayoutEffect } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

import AppLoading from "expo-app-loading";
import { useFonts } from "expo-font";

import {
  Container,
  AddButton,
  AddButtonImage,
  NotesList,
  NoNotes,
  NoNotesImage,
  NoNotesText,
} from "./styles";

import NoteItem from "../../components/NoteItem";

export default () => {
  const navigation = useNavigation();
  const list = useSelector((state) => state.notes.list);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Your notes",
      headerLeft: false,
      headerRight: () => (
        <AddButton
          underlayColor="transparent"
          onPress={() => navigation.navigate("EditNote")}
        >
          <AddButtonImage source={require("../../assets/more.png")} />
        </AddButton>
      ),
    });
  }, []);

  const handleNotePress = (index) => {
    navigation.navigate("EditNote", {
      key: index,
    });
  };

  let [fontsLoaded, error] = useFonts({
    "WorkSans-SemiBold": require("../../../assets/fonts/WorkSans/WorkSans-SemiBold.ttf"),
    "WorkSans-Regular": require("../../../assets/fonts/WorkSans/WorkSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <Container>
      {list.length > 0 && (
        <NotesList
          data={list}
          renderItem={({ item, index }) => (
            <NoteItem data={item} index={index} onPress={handleNotePress} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
      {list.length === 0 && (
        <NoNotes>
          <NoNotesImage source={require("../../assets/nonotes.png")} />
          <NoNotesText style={{ fontFamily: "WorkSans-SemiBold" }}>
            No annotations
          </NoNotesText>
        </NoNotes>
      )}
    </Container>
  );
};
