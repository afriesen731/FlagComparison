import '../scss/styles.scss'


import 'bootstrap';
import 'dotenv';

import {
    Flag
} from "../js/structures.js"
import {
    flagsRef,
} from "../js/firebase.js"
import { 
    getDocs, 
    doc,
    query, 
    where,
    orderBy,
    getDoc,
    updateDoc,
    limit,
    getCountFromServer,
    startAfter, 
    increment,
} from "firebase/firestore";






async function main(){
    // Uncomment this to reset all flag scores to the initial value (1400)
    // await resetAllScores()

    const k = 64;   // Constant for score calculation
    const wait = 750;   // Time delay in milliseconds for displaying names

    // Keys for storing flags in the session storage
    const groupKey = "flags"
    const lastFlagKey = "last"
    const flagOneKey = "flag1";
    const flagTwoKey = "flag2";


    // List of keys for the two flags in the current comparison
    const flagKeyList = [flagOneKey, flagTwoKey];
    

    // DOM elements for displaying flag images
    const flagOneElement = document.getElementById("flag-one");
    const flagTwoElement = document.getElementById("flag-two");

    // DOM elements for country names
    const nameOneElement = document.getElementById("name-one")
    const nameTwoElement = document.getElementById("name-two")

    // DOM elements that contain the flags
    const optionOneElement = document.getElementById("option-one");
    const optionTwoElement = document.getElementById("option-two")


    // Check if flags are saved in session storage
    let flagsSaved  = await cacheSavedCheck(groupKey, [flagOneKey, flagTwoKey, lastFlagKey])
    
    // If flags are not saved in session storage, load from database
    if (!flagsSaved) {
        
        let flagsLen = await getQueryCount(flagsRef);

        // offset to make sure there are enough flags to display
        let randStartFlag = await getRandDBFlag(flagsLen - 2);

        
        // Retrieve 10 flags from db starting from the random flag
        let tempDocs = await getFlagGroupData(randStartFlag, 11)

        // stores all but last flag
        storeFlagsInBrowser(groupKey, tempDocs.slice(0, -1));

        // store last flag
        // keeps the lastFlagKey so it can detect when it is at the end of the storage
        storeFlagsInBrowser(lastFlagKey, tempDocs.slice(-1)[0]);

        
        

        popAndStoreLocalFlags(groupKey, flagKeyList);


    }

    // Set the flag image sources for the first and second flags
    setFlagSrc(flagOneKey, flagOneElement);
    setFlagSrc(flagTwoKey, flagTwoElement);




    // Add event listener for the first voting option
    optionOneElement.addEventListener("click", async function() {
        optionOneElement.classList.add("active");

        // Display the names of the flags after the user votes
        await displayNames([flagOneElement, flagTwoElement], [nameOneElement, nameTwoElement], flagKeyList, wait);
        optionOneElement.classList.remove("active");    // Remove the highlight

        // Register the vote
        flagVote(flagOneKey, flagTwoKey, flagOneElement, flagTwoElement, groupKey, lastFlagKey, k);
    });

    // Add event listener for the second voting option
    optionTwoElement.addEventListener("click", async function() {
        optionTwoElement.classList.add("active");   // Highlight the option

        // Display the names of the flags after the user votes
        await displayNames([flagOneElement, flagTwoElement], [nameOneElement, nameTwoElement], flagKeyList, wait);
        optionTwoElement.classList.remove("active");    // Remove the highlight

        // Register the vote
        flagVote(flagTwoKey, flagOneKey, flagTwoElement, flagOneElement, groupKey, lastFlagKey, k);
    });

}


/**
 * Displays the names of the flags being voted on, clears them after a wait period.
 * @param {Array} flagElementList - List of flag image elements.
 * @param {Array} flagNameElements - List of name elements for the flags.
 * @param {Array} flagKeyList - List of keys for the flags in session storage.
 * @param {number} wait - Time to wait before clearing the names (in milliseconds).
 */
async function displayNames(flagElementList, flagNameElements, flagKeyList, wait) { // lists need to be in same order
    for (let i = 0; i < flagElementList.length; i++) {
        flagElementList[i].setAttribute("src", "");
        let flagData = getSessionStorage(flagKeyList[i]);
        flagNameElements[i].innerHTML = flagData.country;
    }

    await sleep(wait);

    for (let i = 0; i < flagNameElements.length; i++) {

        flagNameElements[i].innerHTML = "";
    }

}

/**
 * Sets the image source for a flag element based on session storage.
 * @param {string} flagKey - The session storage key for the flag.
 * @param {HTMLElement} flagElement - The HTML element where the flag image will be displayed.
 */
function setFlagSrc(flagKey, flagElement) {
    let flagData = getSessionStorage(flagKey);
    flagElement.setAttribute("src", flagData.flag);
    
}

/**
 * Handles a vote for a flag, updates scores, and loads the next flags.
 * @param {string} winnerKey - Key for the winning flag.
 * @param {string} loserKey - Key for the losing flag.
 * @param {HTMLElement} winnerElement - DOM element for the winning flag image.
 * @param {HTMLElement} loserElement - DOM element for the losing flag image.
 * @param {string} groupKey - Session storage key for the flag group.
 * @param {string} lastFlagKey - Session storage key for the last flag.
 * @param {number} k - Factor for score adjustment.
 */
async function flagVote(winnerKey, loserKey, winnerElement, loserElement, groupKey, lastFlagKey, k) {

    flagCompare(winnerKey, loserKey, k);

    let flags = popAndStoreLocalFlags(groupKey, [winnerKey, loserKey]);


    if (!flags) {
        await nextPage(groupKey, lastFlagKey, [winnerKey, loserKey]);
        flags = popAndStoreLocalFlags(groupKey, [winnerKey, loserKey]);
    }

    setFlagSrc(winnerKey, winnerElement);
    setFlagSrc(loserKey, loserElement);




}



/**
 * Fetches new flag data and updates the current flag set in the local storage.
 * This function loads new flags when the current set is used.
 * 
 * @param {string} groupKey - The key to access the flag group data in sessionStorage.
 * @param {string} lastFlagKey - The key to access the last stored flag in sessionStorage.
 * @param {Array} flagKeyList - List of flag keys to update the displayed flags.
 */
async function nextPage(groupKey, lastFlagKey, flagKeyList) {


    let lastFlagData = getSessionStorage(lastFlagKey);

    let lastFlagRef = doc(flagsRef, lastFlagData.id);

    let downloadedFlags = await getFlagGroupData(lastFlagRef, 10);


    // creates new list with last and downloaded flags
    let newFlags = [lastFlagData].concat(downloadedFlags);

    // adds all but last flag to flag group
    storeFlagsInBrowser(groupKey, newFlags.slice(0, -1)); 
    console.log("\nall flags: ")
    console.log(newFlags)
    let temp = newFlags.slice(-1)[0];
    console.log("last flag: ")
    console.log(temp.country)

    // store last
    storeFlagsInBrowser(lastFlagKey, newFlags.slice(-1)[0])

    // pop and store flag 1 and 2
    popAndStoreLocalFlags(groupKey, flagKeyList);
}


/**
 * Compares two flags' scores and updates them in the database based on a ranking algorithm.
 * 
 * @param {string} winnerKey - The sessionStorage key of the winning flag.
 * @param {string} loserKey - The sessionStorage key of the losing flag.
 * @param {number} k - The scaling factor for score adjustment.
 */
async function flagCompare(winnerKey, loserKey, k) {
    let winnerFlag = getSessionStorage(winnerKey);
    let winnerDocRef = doc(flagsRef, winnerFlag.id);

    let loserFlag = getSessionStorage(loserKey);
    let loserDocRef = doc(flagsRef, loserFlag.id);
    



    let scoreIncrement = scoreChange(winnerFlag.score, loserFlag.score, k);

    updateDoc(winnerDocRef, {score: increment(scoreIncrement)});
    updateDoc(loserDocRef, {score: increment(scoreIncrement * -1)});



}

/**
 * Checks whether the flags are already stored in sessionStorage and caches them if not.
 * 
 * @param {string} groupKey - The key to check for group data in sessionStorage.
 * @param {Array} flagKeyList - List of flag keys to check in sessionStorage.
 * @returns {boolean} - Returns true if the cache exists and is valid, false otherwise.
 */
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


    return true;

}


/**
 * Calculates the score change using the Elo rating system.
 * 
 * @param {number} winner - The current score of the winning flag.
 * @param {number} loser - The current score of the losing flag.
 * @param {number} k - The scaling factor for score adjustment (default: 32).
 * @returns {number} - The score change for the winner.
 */
function scoreChange(winner, loser, k=32) {
    let chanceOfWinning =  (1 / ( 1 +  10 ** ( ( loser - winner ) / 400 ) ));
    let unsignedchange = Math.round(k * (1 - chanceOfWinning))
    return unsignedchange;
}

/**
 * Pops a random flag from the group and stores it under specified flag keys.
 * 
 * @param {string} groupKey - The key to retrieve the flag group data from sessionStorage.
 * @param {Array} flagKeys - Array of keys to store individual flags.
 * @returns {Array|null} - Array of flags if available, otherwise null.
 */
function popAndStoreLocalFlags(groupKey, flagKeys) {

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

/**
 * Stores the provided flags in sessionStorage under the specified key.
 * 
 * @param {string} key - The sessionStorage key.
 * @param {Array|Object} flags - The flags data to store.
 */
function storeFlagsInBrowser(key, flags) {orderBy
    sessionStorage.setItem(key, JSON.stringify(flags));
}


/**
 * Retrieves data from sessionStorage.
 * 
 * @param {string} key - The sessionStorage key.
 * @returns {Object} - The parsed object stored under the given key.
 */
function getSessionStorage(key) {
    let storage = JSON.parse(sessionStorage.getItem(key));
    return storage;
}

/**
 * Checks if a given key in sessionStorage is empty.
 * 
 * @param {string} key - The sessionStorage key.
 * @returns {boolean} - Returns true if the key does not exist or is empty, false otherwise.
 */
function sessionStorageIsEmpty(key) {
    return !sessionStorage.getItem(key);
}

/**
 * Retrieves a group of flags from the database, starting after a specific flag.
 * 
 * @param {Object} startAfterFlag - The reference to the flag document to start after.
 * @param {number} len - The number of flags to retrieve (default: 10).
 * @returns {Array} - Array of flag data objects.
 */
async function getFlagGroupData(startAfterFlag, len=10) {

    let docSnap = await getDoc(startAfterFlag);
    let q;

    
    if (startAfterFlag) {
        q = query(flagsRef, orderBy("score"), startAfter(docSnap), limit(len));
    }
    else {
        q = query(flagsRef, orderBy("score"), limit(len));
    }
    
    let flagSnapshots = await getDocs(q);



    let flagDocs = flagSnapshots.docs;

    // starts at beggining if at end
    if (flagDocs.length < len) {
        q = query(flagsRef, orderBy("score"), limit(len));
        flagSnapshots = await getDocs(q);
        flagDocs = flagDocs.concat(flagSnapshots.docs);

    }
    

    let flagDataList = [];


    for (let doc of flagDocs) {
        let flagData = doc.data();
        flagData["id"] = doc.id;


        flagDataList.push(flagData)
    }
    return flagDataList;
} 



/**
 * Retrieves a random flag from the database based on its index.
 * 
 * @param {number} flagsLen - The total number of flags in the database.
 * @returns {Object} - The document reference to the random flag.
 */
async function getRandDBFlag(flagsLen) {

    
    let randIndex = Math.floor(Math.random() * flagsLen);

    let randQuery = await query(flagsRef, where("randPosition", "==", randIndex), limit(1));
    let randFlag = await getDocs(randQuery);
    randFlag = randFlag.docs[0];
    randFlag = doc(flagsRef, randFlag.id);
    
    return randFlag;
}


/**
 * Pops a random flag from the group stored in sessionStorage.
 * 
 * @param {string} groupKey - The key to retrieve the flag group data from sessionStorage.
 * @returns {Object|null} - The randomly selected flag or null if none are available.
 */
function popRandFlag(groupKey) {

    
    let index = randDocIndex(groupKey)

    if (index != null) {
        return popLocalFlag(groupKey, index);
    }
    else {
        return null;
    }
    
}

/**
 * Gets a random index from the flag group stored in sessionStorage.
 * 
 * @param {string} groupKey - The key to retrieve the flag group data.
 * @returns {number|null} - The random index or null if the group is empty.
 */
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

/**
 * Removes a flag from sessionStorage at the specified index.
 * 
 * @param {string} groupKey - The key to retrieve the flag group data.
 * @param {number} index - The index of the flag to remove.
 * @returns {Object} - The removed flag data.
 */
function popLocalFlag(groupKey, index) {
    let groupData = getSessionStorage(groupKey)
    let flag = groupData.pop(index)
    storeFlagsInBrowser(groupKey, groupData);
    return flag;
}


/**
 * Retrieves the total count of documents that match a given query.
 * 
 * @param {Object} query - The Firestore query to count documents for.
 * @returns {Promise<number>} - A promise that resolves to the total count of matching documents.
 */
async function getQueryCount(query) {

    let snapshot = await getCountFromServer(query);

    let totalDocs = snapshot.data().count;

    return totalDocs;
}



/**
 * Saves the last flag in the current group to sessionStorage.
 * 
 * @param {string} lastFlagKey - The key to store the last flag in sessionStorage.
 * @param {string} groupKey - The key to retrieve the group of flags from sessionStorage.
 */
function saveLastFlag(lastFlagKey, groupKey) {
    let groupData = getSessionStorage(groupKey);

    let lastFlag = groupData[-1];


    storeFlagsInBrowser(lastFlagKey, lastFlag);


}

/**
 * Resets the score of all flags in the database to the default value (1400).
 * 
 */
async function resetAllScores() {
    let allDocs = await getDocs(flagsRef);
    allDocs = allDocs.docs
    for (let document of allDocs) {
        await updateDoc(document.ref, {score: 1400});
    }
}


/**
 * Pauses execution for a specified amount of time.
 * 
 * @param {number} ms - The duration to pause in milliseconds.
 * @returns {Promise<void>} - A promise that resolves after the specified delay.
 */
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



main()


