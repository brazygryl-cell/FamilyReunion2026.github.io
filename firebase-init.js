const firebaseConfig = {
  apiKey: "AIzaSyAldYSp37LZO31XkGc4F1xhnQ9bpBXLU6Q",
  authDomain: "williams-reunion.firebaseapp.com",
  projectId: "williams-reunion",
  storageBucket: "williams-reunion.appspot.com",
  messagingSenderId: "1053815265185",
  appId: "1:1053815265185:web:050db056f81ab9d2d81de0"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
