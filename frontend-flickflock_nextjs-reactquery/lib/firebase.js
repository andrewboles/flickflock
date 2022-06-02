import firebase from 'firebase/compat/app'
import 'firebase/compat/storage';



const firebaseConfig = {
    apiKey: "AIzaSyCMisVhOb-csrMsBzj0gV6ZCU74FMLlxAo",
    authDomain: "flickflock-remix.firebaseapp.com",
    projectId: "flickflock-remix",
    storageBucket: "flickflock-remix.appspot.com",
    messagingSenderId: "258025230646",
    appId: "1:258025230646:web:d8fe8d55334732a8d4e397"
  };    

  if (!firebase.apps.length){
	firebase.initializeApp(firebaseConfig)
}


export const storage = firebase.storage();
export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED;