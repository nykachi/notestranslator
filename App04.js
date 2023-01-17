/* ************                All Imports               **********/
import * as Font from 'expo-font';
import AddNote from './components/AddNote';
import Notes from './components/Notes';
import EditNote from './components/EditNote';
import DeletedNotes from './components/DeletedNotes';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSelectScreen from './screens/LanguageSelectScreen';
import colors from './utils/colors';
import { Provider } from 'react-redux';
import store from './store/store';
import SavedScreen from './components/SavedScreen';
import SettingsScreen from './screens/SettingsScreen';

//import Footer from './components/Footer';
//import MainContainer from './navigation/MainContainer';

/************         Stack navigator to move between screens                ***********/
const Stack = createNativeStackNavigator();

//**************            Main App function              ***********/
export default function App() {
  const [note, setNote] = useState();
  const [notes, setNotes] = useState([]);
  const [date, setDate] = useState(new Date().toUTCString());
  const [edit, setEdit] = useState();
  const [moveToBin, setMoveToBin] = useState([]);

  const [appIsLoaded, setAppIsLoaded] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await Font.loadAsync({
          black: require('./assets/fonts//Roboto-Black.ttf'),
          blackItalic: require('./assets/fonts/Roboto-BlackItalic.ttf'),
          bold: require('./assets/fonts/Roboto-Bold.ttf'),
          boldItalic: require('./assets/fonts/Roboto-BoldItalic.ttf'),
          italic: require('./assets/fonts/Roboto-Italic.ttf'),
          light: require('./assets/fonts/Roboto-Light.ttf'),
          lightItalic: require('./assets/fonts/Roboto-LightItalic.ttf'),
          medium: require('./assets/fonts/Roboto-Medium.ttf'),
          mediumItalic: require('./assets/fonts/Roboto-MediumItalic.ttf'),
          regular: require('./assets/fonts/Roboto-Regular.ttf'),
          thin: require('./assets/fonts/Roboto-Thin.ttf'),
          thinItalic: require('./assets/fonts/Roboto-ThinItalic.ttf'),
        });
      } catch (e) {
        console.log(e);
      } finally {
        setAppIsLoaded(true);
      }
    };

    prepare();
  }, []);

  //***************             Function to Submit new note             ***********/
  function handleNote(noteValue = '') {
    const newNote = noteValue || note;
    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    setNote('');
    // ["monkey", "chicken"] ->  [{"text": "monkey", "date": "12/31 1:01pm"}, {"text": "chicken ", "date": "12/31 1:02pm"}]

    AsyncStorage.setItem('storedNotes', JSON.stringify(newNotes))
      .then(() => {
        setNotes(newNotes);
      })
      .catch((error) => console.log(error));

    AsyncStorage.setItem('date', JSON.stringify(date)).then(() => {
      setDate(date);
    });
  }

  // **********             Hook to load saved notes when app restarts            ***********/
  useEffect(() => {
    loadNotes();
  }, []);

  // ************              Function to get Notes from async storage in Notes component              ***********/
  const loadNotes = () => {
    AsyncStorage.getItem('storedNotes')
      .then((data) => {
        if (data !== null) {
          // console.log({ data });
          // console.log(JSON.parse(data));
          setNotes(JSON.parse(data));
        }
      })
      .catch((error) => console.log(error));

    AsyncStorage.getItem('deletedNotes')
      .then((data) => {
        if (data !== null) {
          setMoveToBin(JSON.parse(data));
        }
      })
      .catch((error) => console.log(error));

    AsyncStorage.getItem('date');
  };

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          {/* **********           Notes Component Screen             ***********/}
          <Stack.Group>
            <Stack.Screen name="Notes">
              {(props) => (
                <Notes
                  {...props}
                  notes={notes}
                  setNotes={setNotes}
                  date={date}
                  setDate={setDate}
                  note={note}
                  setNote={setNote}
                  edit={edit}
                  setEdit={setEdit}
                  moveToBin={moveToBin}
                  setMoveToBin={setMoveToBin}
                />
              )}
            </Stack.Screen>
          </Stack.Group>

          {/* ***********            Add new note Component Screen              ***********/}
          <Stack.Group>
            <Stack.Screen name="AddNote">
              {(props) => (
                <AddNote
                  {...props}
                  note={note}
                  setNote={setNote}
                  handleNote={handleNote}
                />
              )}
            </Stack.Screen>
          </Stack.Group>

          {/* ************                 Edit Note Component Screen             **********/}
          <Stack.Group>
            <Stack.Screen name="EditNote">
              {(props) => (
                <EditNote
                  {...props}
                  edit={edit}
                  setEdit={setEdit}
                  notes={notes}
                  setNotes={setNotes}
                  note={note}
                  moveToBin={moveToBin}
                  setMoveToBin={setMoveToBin}
                />
              )}
            </Stack.Screen>
          </Stack.Group>

          {/**********              Deleted Notes component Screen                ************/}
          <Stack.Group>
            <Stack.Screen name="DeletedNotes">
              {(props) => (
                <DeletedNotes
                  {...props}
                  moveToBin={moveToBin}
                  setMoveToBin={setMoveToBin}
                  notes={notes}
                  setNotes={setNotes}
                  date={date}
                />
              )}
            </Stack.Screen>
          </Stack.Group>

          <Stack.Group
            screenOptions={{
              presentation: 'containedModal',
              headerStyle: {
                backgroundColor: 'white',
              },
              headerTitleStyle: {
                color: colors.textColor,
                fontFamily: 'medium',
              },
            }}
          >
            <Stack.Screen
              name="LanguageSelectScreen"
              component={LanguageSelectScreen}
            />
          </Stack.Group>

          {/* ***********            Add saved notes Component Screen              ***********/}
          <Stack.Group>
            <Stack.Screen name="SavedScreen">
              {(props) => <SavedScreen />}
            </Stack.Screen>
          </Stack.Group>

          {/* ***********            Add saved notes Component Screen              ***********/}
          <Stack.Group>
            <Stack.Screen name="SettingsScreen">
              {(props) => <SettingsScreen />}
            </Stack.Screen>
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
