/*****                      All Imports                   ******/
import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import * as Style from '../assets/styles';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import colors from '../utils/colors';
import supportedLanguages from '../utils/supportedLanguages';
import * as Clipboard from 'expo-clipboard';
import { translate } from '../utils/translate';
import { useDispatch, useSelector } from 'react-redux';
import { addHistoryItem, setHistoryItems } from '../store/historySlice';
import TranslationResult from '../components/TranslationResult';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSavedItems } from '../store/savedItemsSlice';
//import Clipboard from '@react-native-clipboard/clipboard';
// import Clipboard from '@react-native-community/clipboard';
import Tts from 'react-native-tts';

const loadData = () => {
  return async (dispatch) => {
    try {
      const historyString = await AsyncStorage.getItem('history');
      if (historyString !== null) {
        const history = JSON.parse(historyString);
        dispatch(setHistoryItems({ items: history }));
      }

      const savedItemsString = await AsyncStorage.getItem('savedItems');
      if (savedItemsString !== null) {
        const savedItems = JSON.parse(savedItemsString);
        dispatch(setSavedItems({ items: savedItems }));
      }
    } catch (error) {
      console.log(error);
    }
  };
};

/********            Add New Note Main Component        *******/
const AddNote = ({ route, navigation, ...props }) => {
  const params = route.params || {};

  const dispatch = useDispatch();
  const history = useSelector((state) => state.history.items);

  const [enteredText, setEnteredText] = useState('');
  const [resultText, setResultText] = useState('');
  const [languageTo, setLanguageTo] = useState('ko');
  const [languageFrom, setLanguageFrom] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (params.languageTo) {
      setLanguageTo(params.languageTo);
    }
    if (params.languageFrom) {
      setLanguageFrom(params.languageFrom);
    }
  }, [params.languageTo, params.languageFrom]);

  useEffect(() => {
    dispatch(loadData());
  }, [dispatch]);

  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem('history', JSON.stringify(history));
      } catch (error) {
        console.log(error);
      }
    };

    saveHistory();
  }, [history]);

  const onAdd = useCallback((note = '', shouldNavigate = true) => {
    const _note = note || props.note;
    if (_note == '') {
      Alert.alert('Please type something!');
    } else {
      props.handleNote(_note);
      if (shouldNavigate) {
        navigation.navigate('Notes');
      }
    }
  });

  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await translate(enteredText, languageFrom, languageTo);

      if (!result) {
        setResultText('');
        return;
      }

      const textResult = result.translated_text[result.to];
      setResultText(textResult);

      const id = uuid.v4();
      result.id = id;
      result.dateTime = new Date().toISOString();

      dispatch(addHistoryItem({ item: result }));
      onAdd((note = enteredText), (shouldNavigate = false));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [enteredText, languageTo, languageFrom, dispatch]);

  // const handleVoice = (ttsText) => {
  //   // IOS
  //   Tts.speak(
  //     { resultText },
  //     {
  //       iosVoiceId: 'com.apple.ttsbundle.Moira-compact',
  //       rate: 0.5,
  //     }
  //   );
  //   // Android
  //   Tts.speak(
  //     { resultText },
  //     {
  //       androidParams: {
  //         KEY_PARAM_PAN: -1,
  //         KEY_PARAM_VOLUME: 0.5,
  //         KEY_PARAM_STREAM: 'STREAM_MUSIC',
  //       },
  //     }
  //   );
  // };

  const copyToClipboard = useCallback(async () => {
    await Clipboard.setStringAsync(resultText);
  }, [resultText]);

  return (
    <View style={styles.container}>
      <View style={styles.languageContainer}>
        <TouchableOpacity
          style={styles.languageOption}
          onPress={() =>
            navigation.navigate('LanguageSelectScreen', {
              title: 'Translate from',
              selected: languageFrom,
              mode: 'from',
            })
          }
        >
          <Text style={styles.languageOptionText}>
            {supportedLanguages[languageFrom]}
          </Text>
        </TouchableOpacity>

        <View style={styles.arrowContainer}>
          <AntDesign name="arrowright" size={24} color={colors.lightGrey} />
        </View>

        <TouchableOpacity
          style={styles.languageOption}
          onPress={() =>
            navigation.navigate('LanguageSelectScreen', {
              title: 'Translate to',
              selected: languageTo,
              mode: 'to',
            })
          }
        >
          <Text style={styles.languageOptionText}>
            {supportedLanguages[languageTo]}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          multiline
          placeholder="Enter text"
          style={styles.textInput}
          onChangeText={(text) => setEnteredText(text)}
        />

        <TouchableOpacity
          onPress={isLoading ? undefined : onSubmit}
          disabled={enteredText === ''}
          style={styles.iconContainer}
        >
          {isLoading ? (
            <ActivityIndicator size={'small'} color={colors.primary} />
          ) : (
            <Ionicons
              name="arrow-forward-circle-sharp"
              size={24}
              color={
                enteredText !== '' ? colors.primary : colors.primaryDisabled
              }
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{resultText}</Text>

        <View style={styles.iconContainer}>
          <TouchableOpacity
            // onPress={handleVoice}
            onPress={copyToClipboard}
            disabled={resultText === ''}
            //style={styles.iconContainer}//
          >
            <MaterialIcons
              name="speaker"
              size={25}
              color={
                'black'
                //resultText !== '' ? colors.textColor : colors.textColorDisabled//
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={copyToClipboard}
            disabled={resultText === ''}
          >
            <MaterialIcons
              name="content-copy"
              size={24}
              color={
                resultText !== '' ? colors.textColor : colors.textColorDisabled
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.historyContainer}>
        <FlatList
          data={history.slice().reverse()}
          renderItem={(itemData) => {
            return <TranslationResult itemId={itemData.item.id} />;
          }}
        />
      </View>

      {/* <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          behavior="padding"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {// Add Note Container }
            <View style={{ padding: 20, justifyContent: 'space-around' }}>
              {// Input Field to add new note}
              <TextInput
                style={[styles.input]}
                placeholder="Type Here..."
                onChangeText={(text) => props.setNote(text)}
                value={props.note}
                multiline={true}
              />

              {// Add Note Button}
              <TouchableOpacity style={styles.button} onPress={onAdd}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScrollView> */}
    </View>
  );
};

/*******      Styles            *******/
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  languageContainer: {
    flexDirection: 'row',
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
  },
  languageOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  arrowContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageOptionText: {
    color: colors.primary,
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
  },
  textInput: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontFamily: 'regular',
    letterSpacing: 0.3,
    height: 90,
    color: colors.textColor,
  },
  iconContainer: {
    flexDirection: 'column',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 90,
    paddingVertical: 15,
  },
  resultText: {
    fontFamily: 'regular',
    letterSpacing: 0.3,
    color: colors.primary,
    flex: 1,
    marginHorizontal: 20,
  },

  historyContainer: {
    backgroundColor: colors.greyBackground,
    flex: 1,
    padding: 10,
  },
  addNoteContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    padding: 10,
    paddingTop: 15,
    width: '100%',
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
    opacity: 0.8,
    shadowColor: Style.color,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'white',
    borderColor: Style.color,
    borderWidth: 2,
    borderRadius: 5,
    height: 100,
  },
  button: {
    backgroundColor: Style.color,
    width: '40%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
});
export default AddNote;
