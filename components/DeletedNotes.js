/*****                      All Imports                   ******/
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as Style from '../assets/styles';
import { styles } from './Notes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDate } from '../utils/formatDate';

/*************            Deleted Note Main component              *********/
const DeletedNotes = ({ route, navigation, ...props }) => {
  /************        Function to undo note from deleted component and get back in Main Note component           ***********/
  function undoNote(index) {
    let getBack = props.moveToBin[index];
    let array = [getBack, ...props.notes];
    props.setNotes(array);

    AsyncStorage.setItem('storedNotes', JSON.stringify(array))
      .then(() => {
        props.setNotes(array);
      })
      .catch((error) => console.log(error));

    let newArray = [...props.moveToBin];
    newArray.splice(index, 1);
    props.setMoveToBin(newArray);

    AsyncStorage.removeItem('deletedNotes', () => {
      return;
    });
  }

  {
    /***********               Function to undo All Deleted Notes              ********* */
  }
  function undoAllNotes() {
    let deletedNotes = [...props.moveToBin];
    let notes = [...props.notes];
    deletedNotes.forEach((item, index) => {
      notes.push(item);
    });
    props.setMoveToBin([]);
    props.setNotes(deletedNotes);

    AsyncStorage.setItem('storedNotes', JSON.stringify(notes))
      .then(() => {
        props.setNotes(notes);
      })
      .catch((error) => console.log(error));

    AsyncStorage.setItem('deletedNotes', JSON.stringify([]))
      .then(() => {
        props.setMoveToBin([]);
      })
      .catch((error) => console.log(error));
  }

  /*********              Function to permanently delete note          **********/
  function permanentDelete(index) {
    Alert.alert(
      'Delete',
      'Are you sure you want to permanently delete this item?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            let newArray = [...props.moveToBin];
            newArray.splice(index, 1);
            props.setMoveToBin(newArray);

            AsyncStorage.setItem('deletedNotes', JSON.stringify(newArray))
              .then(() => {
                props.setMoveToBin(newArray);
              })
              .catch((error) => console.log(error));
          },
        },
      ]
    );
  }

  /*************              Function to empty the deleted notes component           *************/
  function emptyBin() {
    Alert.alert(
      'Delete All',
      'Are you sure you want to permanently delete all notes?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            let emptyArray = [...props.moveToBin];
            emptyArray = [];
            props.setMoveToBin(emptyArray);

            AsyncStorage.setItem('deletedNotes', JSON.stringify(emptyArray))
              .then(() => {
                props.setMoveToBin(emptyArray);
              })
              .catch((error) => console.log(error));
          },
        },
      ]
    );
  }
  console.log(props.moveToBin.length, props.moveToBin);

  return (
    <ScrollView>
      {/************                 Deleted Note Container              ***********/}
      <View style={[styles.notesContainer]}>
        {/***********                   Header Container            *********** */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/***********               Undo All Notes Button           *********** */}
          <TouchableOpacity
            style={style.emptyButton}
            onPress={() => undoAllNotes()}
            disabled={props.moveToBin.length === 0 ? true : false}
          >
            <Text style={style.emptyButtonText}>Undo All</Text>
          </TouchableOpacity>

          {/*************             Total Deleted Notes             *********** */}
          <Text style={{ fontWeight: '700', fontSize: 18, color: Style.color }}>
            Total: {props.moveToBin.length}
          </Text>

          {/*****************            Empty Button                **************/}
          <TouchableOpacity
            style={style.emptyButton}
            onPress={() => emptyBin()}
            disabled={props.moveToBin.length === 0 ? true : false}
          >
            <Text style={style.emptyButtonText}>Empty</Text>
          </TouchableOpacity>
        </View>

        {/* **********               Divider                **********/}
        <View style={styles.divider}></View>

        {props.moveToBin.length === 0 ? (
          /****************            Nothing to show           **********/
          <View style={styles.emptyNoteContainer}>
            <Text style={styles.emptyNoteText}>Nothing to show yet...!</Text>
          </View>
        ) : (
          /************              Deleted Notes to show            *********/
          props.moveToBin.map((item, index) => (
            /*************         Note Card Container              ********/
            <View style={styles.item} key={index}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                {/************       Note Card               **********/}
                <View style={styles.note}>
                  <Text style={styles.index}>{index + 1}. </Text>
                  <Text style={styles.text}>{item.original_text}</Text>
                </View>

                {/************          Undo Note Button                **********/}
                <TouchableOpacity onPress={() => undoNote(index)}>
                  <Text style={styles.delete}>Undo</Text>
                </TouchableOpacity>
              </View>

              {/* ***********              Date Container                  *******/}
              <View style={styles.dateContainer}>
                <Text>{formatDate(item.dateTime)}</Text>

                {/* ***********             Permanent Delete Button             *********/}
                <TouchableOpacity onPress={() => permanentDelete(index)}>
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

/******          Styles             *********/
const style = StyleSheet.create({
  emptyButton: {
    backgroundColor: Style.color,
    width: '25%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    marginBottom: 5,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DeletedNotes;
