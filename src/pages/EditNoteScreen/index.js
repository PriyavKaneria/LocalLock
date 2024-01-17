import React, { useState, useEffect, useLayoutEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRoute, useNavigation } from "@react-navigation/native"

import {
	Container,
	TitleInput,
	BodyInput,
	SaveButton,
	SaveButtonImage,
	CloseButton,
	CloseButtonImage,
	ButtonsContainer,
	DeleteButton,
	DeleteButtonText,
	SuccessButton,
	SuccessButtonText,
	NoSuccessButton,
	NoSuccessButtonText,
} from "./styles"

export default () => {
	const navigation = useNavigation()
	const route = useRoute()
	const dispatch = useDispatch()
	const list = useSelector((state) => state.notes.list)

	const [title, setTitle] = useState("")
	const [body, setBody] = useState("")
	const [done, setDone] = useState(false)
	const [status, setStatus] = useState("new")

	useEffect(() => {
		if (route.params?.key !== undefined && list[route.params.key]) {
			setStatus("edit")
			setTitle(list[route.params.key].title)
			setBody(list[route.params.key].body)
			setDone(list[route.params.key].done)
		}
	}, [])

	useLayoutEffect(() => {
		navigation.setOptions({
			title: status === "new" ? "New Note" : "Edit Note",
			headerLeft: () => (
				<CloseButton underlayColor='transparent' onPress={handleCloseButton}>
					<CloseButtonImage source={require("../../assets/close.png")} />
				</CloseButton>
			),
			headerRight: () => (
				<SaveButton underlayColor='transparent' onPress={handleSaveButton}>
					<SaveButtonImage source={require("../../assets/save.png")} />
				</SaveButton>
			),
		})
	}, [status, title, body])

	const handleSaveButton = () => {
		if (title !== "" && body !== "") {
			if (status === "edit") {
				dispatch({
					type: "EDIT_NOTE",
					payload: {
						key: route.params.key,
						title,
						body,
						done,
					},
				})
			} else {
				dispatch({
					type: "ADD_NOTE",
					payload: { title, body },
				})
			}

			navigation.navigate("List")
		} else {
			alert("Preencha titulo e corpo")
		}
	}

	const handleCloseButton = () => navigation.navigate("List")

	const handleDeleteNote = () => {
		dispatch({
			type: "DELETE_NOTE",
			payload: {
				key: route.params.key,
			},
		})
		navigation.navigate("List")
	}

	const handleSuccessNote = () => {
		dispatch({
			type: "SUCCESS_NOTE",
			payload: {
				key: route.params.key,
				title,
				body,
			},
		})
		navigation.navigate("List")
	}

	const handleNoSuccessNote = () => {
		dispatch({
			type: "UNCHECK_NOTE",
			payload: {
				key: route.params.key,
				title,
				body,
			},
		})
		navigation.navigate("List")
	}

	return (
		<Container>
			<TitleInput
				value={title}
				onChangeText={(t) => setTitle(t)}
				placeholder='Title | ex: Run 🏃'
				placeholderTextColor='#ccc'
				autoFocus={true}
				style={{ fontFamily: "WorkSans-SemiBold" }}
			/>
			<BodyInput
				value={body}
				onChangeText={(t) => setBody(t)}
				placeholder='Details | ex: Go for a walk tomorrow for an hour or more 😎'
				placeholderTextColor='#ccc'
				multiline={true}
				textAlignVertical='top'
				style={{ fontFamily: "WorkSans-Regular" }}
			/>
			{status === "edit" && (
				<ButtonsContainer>
					<DeleteButton underlayColor='#FF0000' onPress={handleDeleteNote}>
						<DeleteButtonText style={{ fontFamily: "WorkSans-Regular" }}>
							Delete annotation
						</DeleteButtonText>
					</DeleteButton>

					{!done && (
						<SuccessButton underlayColor='#2E8500' onPress={handleSuccessNote}>
							<SuccessButtonText style={{ fontFamily: "WorkSans-Regular" }}>
								Mark as done
							</SuccessButtonText>
						</SuccessButton>
					)}

					{done && (
						<NoSuccessButton
							underlayColor='#2E8500'
							onPress={handleNoSuccessNote}>
							<NoSuccessButtonText style={{ fontFamily: "WorkSans-Regular" }}>
								Uncheck
							</NoSuccessButtonText>
						</NoSuccessButton>
					)}
				</ButtonsContainer>
			)}
		</Container>
	)
}
