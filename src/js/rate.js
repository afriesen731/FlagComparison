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
  startAfter, startAt, setDoc,
  CACHE_SIZE_UNLIMITED, getDocsFromCache, increment, memoryLocalCache, initializeFirestore, getDocFromCache  
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
const db = initializeFirestore(app, {localCache: memoryLocalCache()}); //adds reload storage
const flagsRef = collection(db, 'flags')
const storage = getStorage();
const imgDirRef = ref(storage, "flags")





async function main(){


    const groupKey = "flags"
    const lastFlagKey = "last"

    const flagOneKey = "flag1";
    const flagTwoKey = "flag2";



    const flagKeyList = [flagOneKey, flagTwoKey];
    


    const flagOneElement = document.getElementById("flag-one");
    const flagTwoElement = document.getElementById("flag-two");

    const optionOneElement = document.getElementById("option-one");
    const optionTwoElement = document.getElementById("option-two")


    let flagsSaved  = await cacheSavedCheck(groupKey, [flagOneKey, flagTwoKey, lastFlagKey])
    
    // let flagsSaved = false;

    if (!flagsSaved) {
        
        let flagsLen = await getQueryCount(flagsRef);
        let randStartFlag = await getRandDBFlag(flagsLen - 2); // offset to make sure there are enough flags to display

        
        // gets 10 flags from db and stores them
        let tempDocs = await getFlagGroupData(randStartFlag, 10)
        storeFlagsInBrowser(groupKey, tempDocs);

        // store last flag
        storeFlagsInBrowser(lastFlagKey, tempDocs.slice(-1)[0])

        
        

        // pop and store flag 1 and 2
        popAndStoreLocalFlags(groupKey, flagKeyList);


    }


    setFlagSrc(flagOneKey, flagOneElement);
    setFlagSrc(flagTwoKey, flagTwoElement);





    optionOneElement.addEventListener("click", function() {flagVote(flagOneKey, flagTwoKey, flagOneElement, flagTwoElement, groupKey, lastFlagKey)});
    optionTwoElement.addEventListener("click", function() {flagVote(flagTwoKey, flagOneKey, flagTwoElement, flagOneElement, groupKey, lastFlagKey)});

}

function setFlagSrc(flagKey, flagElement) {
    let flagData = getSessionStorage(flagKey);
    flagElement.setAttribute("src", flagData.flag);
    
}


async function flagVote(winnerKey, loserKey, winnerElement, loserElement, groupKey, lastFlagKey) {

    flagCompare(winnerKey, loserKey);

    let flags = popAndStoreLocalFlags(groupKey, [winnerKey, loserKey]);


    if (!flags) {
        nextPage(groupKey, lastFlagKey, [winnerKey, loserKey]);
    }



    setFlagSrc(winnerKey, winnerElement);
    setFlagSrc(loserKey, loserElement);




}

async function nextPage(groupKey, lastFlagKey, flagKeyList) {


    let lastFlagData = getSessionStorage(lastFlagKey);

    let lastFlagQuery = query(flagsRef, where("id", "==", lastFlagData.id));

    let localLastDoc = await getDocsFromCache(lastFlagQuery);
    localLastDoc = localLastDoc.docs[0];

    let newFlags = await getFlagGroupData(localLastDoc, 10)
    storeFlagsInBrowser(groupKey, newFlags);

    
    

    // pop and store flag 1 and 2
    popAndStoreLocalFlags(groupKey, flagKeyList);
}

async function flagCompare(winnerKey, loserKey) {
    let winnerFlag = getSessionStorage(winnerKey);
    let winnerDocRef = localDocFromData(winnerFlag);

    let loserFlag = getSessionStorage(loserKey);
    let loserDocRef = localDocFromData(loserFlag);
    



    let scoreIncrement = scoreChange(winnerFlag.score, loserFlag.score);

    updateDoc(winnerDocRef, {score: increment(scoreIncrement)});
    updateDoc(loserDocRef, {score: increment(scoreIncrement * -1)});



}


async function localDocFromData(data) {
    // let localQuery = query(flagsRef, where("id", "==", data.id));
    let docRef = doc(flagsRef, data.id);
    let localSnapshot = await getDocFromCache(docRef);
    let localDoc = localSnapshot.doc;
    return localDoc;
}

async function cacheSavedCheck(groupKey, flagKeyList) {
    let localCache;

    if ( sessionStorageIsEmpty(groupKey) ) {
        return false;
        
    }

    else {
        localCache = getSessionStorage(groupKey);
    }
    


    
    
    for (let key of flagKeyList) {
        

        if (sessionStorageIsEmpty(key)) {
            return false;
        }

        else {
            let flagData = getSessionStorage(key);
            localCache.push(flagData);
        }


    }

    


    for (let flagData of localCache) {
        let localSnapshot = await localDocFromData(flagData)

        if (localSnapshot.empty) {
            return false;
        }
    }


    return true;

}

function scoreChange(winner, loser) {
    let unsignedchange = Math.round( (1 / ( 1 +  10 ** ( ( winner - loser ) / 400 ) )) - winner );
    return unsignedchange;
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

    let flagDataList = [];


    for (let doc of flagDocs) {
        let flagData = doc.data();
        flagData["id"] = doc.id;


        flagDataList.push(flagData)
    }
    return flagDataList;
} 

async function getRandDBFlag(flagsLen) {

    
    let randIndex = Math.floor(Math.random() * flagsLen);

    let randQuery = await query(flagsRef, where("randPosition", "==", randIndex), limit(1));
    let randFlag = await getDocs(randQuery);
    
    return randFlag.docs[0];
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


    storeFlagsInBrowser(lastFlagKey, lastFlag);


}



main()

// if the process fails it trys again after getting rid of saved storage
// this prevents errors when the code for the page is updated and the storage format changes
// only use in production

// try {
//     main()
// }

// catch(error) {
//     sessionStorage.clear()
//     main()
// }
