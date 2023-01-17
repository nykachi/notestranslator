/**************               All imports              ***********/
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Keyboard,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Style from '../assets/styles';
import { ApplicationProvider, IconRegistry, Icon } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

/*************            Notes component main function            *************/
const Notes = ({ route, navigation, ...props }) => {
  const [searchNote, setSearchNote] = useState();
  const [refreshing, setRefreshing] = React.useState(false);

  /**************           Function to delete note from notes component and move to Deleted Notes component          ************/
  function deleteNote(index) {
    let newArray = [...props.notes];
    let movedNote = newArray.splice(index, 1);
    props.setNotes(newArray);
    props.setMoveToBin(movedNote);
    let bin = [movedNote, ...props.moveToBin];
    props.setMoveToBin(bin);

    AsyncStorage.setItem('storedNotes', JSON.stringify(newArray))
      .then(() => {
        props.setNotes(newArray);
      })
      .catch((error) => console.log(error));

    AsyncStorage.setItem('deletedNotes', JSON.stringify(bin))
      .then(() => {
        props.setMoveToBin(bin);
      })
      .catch((error) => console.log(error));
  }

  /*************            Function to Delete All notes from Notes component             ***********/
  function clearAllNotes() {
    let emptyArray = [...props.notes];
    let deletedCompArray = [...props.moveToBin];
    emptyArray.forEach((item, index) => {
      deletedCompArray.push(item);
    });
    emptyArray = [];
    props.setNotes(emptyArray);

    props.setMoveToBin(deletedCompArray);

    AsyncStorage.setItem('storedNotes', JSON.stringify(emptyArray))
      .then(() => {
        props.setNotes(emptyArray);
      })
      .catch((error) => console.log(error));

    AsyncStorage.setItem('deletedNotes', JSON.stringify(deletedCompArray))
      .then(() => {
        props.setMoveToBin(deletedCompArray);
      })
      .catch((error) => console.log(error));
  }

  /***********              Function to search note from notes Component              ***********/
  function search() {
    if (searchNote === '') {
      Alert.alert('Type something in search box!!!');
    } else if (searchNote !== '') {
      props.notes.forEach((item, index) => {
        if (item.includes(searchNote)) {
          let searchItem = [...props.notes];
          let firstElOfArray = searchItem[0];
          let index = [...props.notes].indexOf(item);
          searchItem[0] = item;
          searchItem[index] = firstElOfArray;
          props.setNotes(searchItem);
        }
      });
    }
    setSearchNote('');

    Keyboard.dismiss();
  }

  /*************            Refresh Notes Component                **********/
  const wait = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  return (
    /************               Notes Main Container             **********/
    <View style={[styles.notesContainer]}>
      {/* *************                Header                 ***********/}
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>Your Notes...</Text>

        {/*****                      Header Buttons                   ******/}
        <View style={{ flexDirection: 'row' }}>
          {/* *************                Bin Button                ***********/}
          <TouchableOpacity
            style={[styles.button, { marginLeft: 40 }]}
            onPress={() => navigation.navigate('DeletedNotes')}
          >
            <IconRegistry icons={EvaIconsPack} />
            <ApplicationProvider {...eva} theme={eva.light}>
              <Icon
                name="trash-2-outline"
                fill="white"
                style={{ width: 25, height: 50 }}
              />
            </ApplicationProvider>
          </TouchableOpacity>

          {/* *************                Add Note Button                 ***********/}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AddNote')}
          >
            <IconRegistry icons={EvaIconsPack} />
            <ApplicationProvider {...eva} theme={eva.light}>
              <Icon
                name="plus-outline"
                fill="white"
                style={{ width: 25, height: 50 }}
              />
            </ApplicationProvider>
          </TouchableOpacity>
        </View>
      </View>

      {/* *************               Total Notes Count                 ***********/}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontWeight: '700', fontSize: 18, color: Style.color }}>
          Total: {props.notes.length}
        </Text>
      </View>

      {/* **********               Divider                **********/}
      <View style={styles.divider}></View>

      {/* ***********              Search Container               ***********/}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search..."
          placeholderTextColor={Style.color}
          style={[styles.input, { borderWidth: 3 }]}
          value={searchNote}
          onChangeText={(text) => setSearchNote(text)}
        />

        {/* ************                 Search Button              ************/}
        <TouchableOpacity
          style={[styles.searchButton, { width: 50 }]}
          onPress={() => search()}
        >
          <IconRegistry icons={EvaIconsPack} />
          <ApplicationProvider {...eva} theme={eva.light}>
            <Icon
              name="search"
              fill="white"
              style={{ width: 22, height: 40 }}
            />
          </ApplicationProvider>
        </TouchableOpacity>

        {/* ***********             Clear All Notes button                 ***********/}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => clearAllNotes()}
          disabled={props.notes.length === 0 ? true : false}
        >
          <Text style={styles.searchButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* **********               Notes Container                ***********/}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {props.notes.length === 0 ? (
          /**********           When there are nothing in notes, Empty Container should display           ***********/
          <View style={styles.emptyNoteContainer}>
            <Text style={styles.emptyNoteText}>
              There is no note yet! Click on the + button to add...
            </Text>
          </View>
        ) : (
          /************             All Notes            **********/
          props.notes.map((item, index) => (
            /* *************                Note Card Container                 ***********/
            <View style={styles.item} key={index}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                {/* ************                Note Card               **********/}
                <View style={styles.note}>
                  {/* **********               Note index              **********/}
                  <Text style={styles.index}>{index + 1}. </Text>

                  {/* ************                 Note Text              **********/}
                  <Text style={styles.text}>{item}</Text>
                </View>

                {/* *********               Note Delete Button              **********/}
                <TouchableOpacity onPress={() => deleteNote(index)}>
                  <Text style={styles.delete}>X</Text>
                </TouchableOpacity>
              </View>

              {/* ***********              Date Container            *********/}
              <View style={styles.dateContainer}>
                <Text>{props.date}</Text>

                {/* **********              Edit Note Button            *********** */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('EditNote', { i: index, n: item })
                  }
                >
                  <Text style={styles.delete}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

/*********             Styles           **********/
export const styles = StyleSheet.create({
  notesContainer: {
    paddingTop: 10,
    paddingHorizontal: 20,
    marginBottom: 70,
    opacity: 0.9,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: Style.color,
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: Style.color,
    marginTop: 5,
    marginBottom: 5,
  },
  item: {
    marginBottom: 20,
    padding: 15,
    color: 'black',
    opacity: 0.8,
    marginTop: 10,
    shadowColor: Style.color,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'white',
    borderColor: Style.color,
    borderWidth: 2,
    borderRadius: 5,
    borderLeftWidth: 15,
  },
  index: {
    fontSize: 20,
    fontWeight: '800',
  },
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: Style.color,
    width: 50,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    height: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
  },
  scrollView: {
    marginBottom: 70,
  },
  note: {
    flexDirection: 'row',
    width: '75%',
  },
  text: {
    fontWeight: '700',
    fontSize: 17,
    alignSelf: 'center',
  },
  delete: {
    color: Style.color,
    fontWeight: '700',
    fontSize: 15,
  },
  input: {
    height: 40,
    paddingHorizontal: 20,
    width: '65%',
    fontSize: 19,
    color: 'black',
    fontWeight: '600',
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  searchButton: {
    backgroundColor: Style.color,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    borderRadius: 5,
    height: 40,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyNoteContainer: {
    alignItems: 'center',
    marginTop: 240,
  },
  emptyNoteText: {
    color: Style.color,
    fontWeight: '600',
    fontSize: 15,
  },
  dateContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default Notes;
