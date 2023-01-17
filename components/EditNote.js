/************              All Imports              *************/
import React from 'react';
import { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { styles } from './AddNote';
import AsyncStorage from '@react-native-async-storage/async-storage';

/*************            Edit Note Main Component             **********/
const EditNote = ({ route, navigation, ...props }) => {
  console.log(route.params);
  const { i, n } = route.params;
  const [newEdit, setNewEdit] = useState(n);

  /***********              Function to edit Note            ***********/
  function editNote() {
    let edited = [...props.notes];
    edited[i] = { text: newEdit, time: new Date() };
    props.setNotes(edited);

    AsyncStorage.setItem('storedNotes', JSON.stringify(edited))
      .then(() => {
        props.setNotes(edited);
      })
      .catch((error) => console.log(error));

    navigation.navigate('Notes');
  }

  return (
    <ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        behavior="padding"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* ************             Edit Note Container             **********/}
          <View style={{ padding: 20, justifyContent: 'space-around' }}>
            {/* **************               Input Field                ***********/}
            <TextInput
              style={[styles.input]}
              placeholder="Type Here..."
              onChangeText={(text) => setNewEdit(text)}
              value={newEdit.toString()}
              multiline
            />

            {/* **************               Edit Note Button               ************ */}
            <TouchableOpacity style={styles.button} onPress={() => editNote()}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default EditNote;
