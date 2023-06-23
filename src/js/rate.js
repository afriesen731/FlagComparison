// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import 'bootstrap';



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, collection, getDocs,
  addDoc, 
  deleteDoc, doc,
  onSnapshot, docRef,
  query, where,
  orderBy, serverTimestamp,
  getDoc,
  updateDoc,
  limit,
  getCountFromServer,
  startAfter, startAt, setDoc 
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3QJZPH9FbRNaXwrZ3WTINErxbKbyHROc",
  authDomain: "flagcomparison.firebaseapp.com",
  projectId: "flagcomparison",
  storageBucket: "flagcomparison.appspot.com",
  messagingSenderId: "382964268359",
  appId: "1:382964268359:web:c7989ae0993023dd816062",
  measurementId: "G-TRC982V88F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();
const flagsRef = collection(db, 'flags')
const storage = getStorage();
const imgDirRef = ref(storage, "flags")





async function main(){
    const groupKey = "flags"
    const lastFlagKey = "lastId"

    const flag1Key = "flag1";
    const flag2Key = "flag2"
    const flagKeyList = [flag1Key, flag2Key];
    


    const flagOneParent = document.getElementById("flag-one-parent");
    const flagTwoParent = document.getElementById("flag-two-parent")


    
    let flagsSaved = !(sessionStorageIsEmpty(flag1Key) || sessionStorageIsEmpty(flag2Key));

    let lastFlagSaved = !(sessionStorageIsEmpty(lastFlagKey));

    if (!flagsSaved) {

        let flagsLen = await getQueryCount(flagsRef);
        let randStartFlag = await getRandDBFlag(flagsLen - 2); // offset to make sure there are enough flags to display

        
        // gets 10 flags from db and stores them
        let tempDocs = await getFlagGroupData(randStartFlag, 10)
        storeFlagsInBrowser(groupKey, tempDocs);

        
        

        // pop and store flag 1 and 2
        popAndStoreLocalFlags(groupKey, flagKeyList);


    }


    if (!lastFlagSaved) {
        saveLastFlag(lastFlagKey, groupKey);
    }


    let flagOneData = getSessionStorage(flag1Key);
    let flagTwoData = getSessionStorage(flag2Key);


    let flagOneElement = createFlagElement(flagOneData);
    let flagTwoElement = createFlagElement(flagTwoData);

    flagOneParent.appendChild(flagOneElement);
    flagTwoParent.appendChild(flagTwoElement)










}

function popAndStoreLocalFlags(groupKey, flagKeys) {

    let flagGroup = getSessionStorage(groupKey);
    let flags = [];

    for (let flagKey of flagKeys) {

        let flag = popRandFlag(groupKey);

        if (!flag) {
            return null;
        }

        storeFlagsInBrowser(flagKey, flag);

        flags.push(flag)
    }

    return flags;
}

function storeFlagsInBrowser(key, flags) {
    sessionStorage.setItem(key, JSON.stringify(flags));
}

function getSessionStorage(key) {
    let storage = JSON.parse(sessionStorage.getItem(key));
    return storage;
}


function sessionStorageIsEmpty(key) {
    return !sessionStorage.getItem(key);
}


async function getFlagGroupData(startAfterFlag, len=10) {
    let q;
    if (startAfterFlag) {
        q = query(flagsRef, orderBy("score", "desc"), startAfter(startAfterFlag), limit(len));
    }
    else {
        q = query(flagsRef, orderBy("score", "desc"), limit(len));
    }
    
    let flagDocs = await getDocs(q);
    flagDocs = flagDocs.docs;

    let flagData = [];


    for (let doc of flagDocs) {
        flagData.push(doc.data())
    }
    return flagData;
} 

async function getRandDBFlag(flagsLen) {

    
    let randIndex = Math.floor(Math.random() * flagsLen);

    let randQuery = await query(flagsRef, where("randPosition", "==", randIndex), limit(1));
    let randFlag = await getDocs(randQuery);
    
    return randFlag.docs[0];
}


function createFlagElement(flagData){


    const flagElement = document.createElement("img");


    flagElement.setAttribute("src", flagData.flag);


    return flagElement;

}



function popRandFlag(groupKey) {

    
    let index = randDocIndex(groupKey)

    if (index != null) {
        return popLocalFlag(groupKey, index);
    }
    else {
        return null;
    }
    
}


function randDocIndex(groupKey) {
    let groupData = getSessionStorage(groupKey);

    let length = groupData.length;
    
    let index = Math.floor(Math.random() * length);

    if (length != 0) {
        return index
    }
    else {
        return null;
    }
}


function popLocalFlag(groupKey, index) {
    let groupData = getSessionStorage(groupKey)
    let flag = groupData.pop(index)
    storeFlagsInBrowser(groupKey, groupData);
    return flag;
}



async function getQueryCount(query) {

    let snapshot = await getCountFromServer(query);

    let totalDocs = snapshot.data().count;

    return totalDocs;
}




function saveLastFlag(lastFlagKey, groupKey) {
    let groupData = getSessionStorage(groupKey);

    let lastFlag = groupData[-1];
    let lastId = groupData.id;


    storeFlagsInBrowser(lastFlagKey, lastId);


}

main()