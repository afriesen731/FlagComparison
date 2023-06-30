// npm init -y to create package.json
// add "build": "webpack" to "scripts": in json
// run to add webpack "npm i webpack-cli -D"
// create "webpack.config.js" in main project firectory
// recreate content based on the one in this project
// "npm run build" to bundle
// add "<script src="bundle.js" defer></script>" to index
// set up at firebase


// set up bootstrap (optional)
// npm i --save bootstrap @popperjs/core
// npm i --save-dev autoprefixer css-loader postcss-loader sass sass-loader style-loader
// add to webpack.config.js:
// module: {rules: [{test: /\.(scss)$/,use: [{loader: 'style-loader'},{loader: 'css-loader'},{loader: 'postcss-loader',options: {postcssOptions: {plugins: () => [require('autoprefixer')]}}},{loader: 'sass-loader'}]}]}
// create src/scss/styles.scss and add the code in it
// add the classes you use to it
// add this to this file:
// import '../scss/styles.scss'
// import { put bootstrap js funtions that are used in here } from 'bootstrap'
// use command:
// npm install --save-dev mini-css-extract-plugin
// install any loaders that aren't downloaded
// npm run build (it will give errors telling you what loaders you need)
// add this to html:
// <link rel="stylesheet" href="main.css">

// install jquery
// npm install jquery


// firebase init
// set public to dist
// maybe run "firebase init hosting" if not working

// host with "firebase deploy --only hosting"
// now use "npm run deploy" this way it uploads to public dir


// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import 'bootstrap';



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, collection, getDocs,

  query,
  orderBy,
  limit, startAfter
} from "firebase/firestore";
import { getStorage, ref } from "firebase/storage"
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






const rankTable = document.getElementById("flag-rankings");
const nextPageBtn = document.getElementById("next-page-btn")


async function addRankToTable(table, data, rank) {
  // new column

  const newRow = document.createElement("tr");

  // add rank
  let rankData = document.createElement("td");
  rankData.innerHTML = rank
  newRow.appendChild(rankData);


  // add flag
  let flagData = document.createElement("td");
  let flagElement = document.createElement("img");
  flagElement.setAttribute("src", data.flag);
  flagElement.setAttribute("height", "30");

  flagData.appendChild(flagElement);
  newRow.appendChild(flagData);


  // add country
  let countryData = document.createElement("td");
  countryData.innerHTML = data.country;

  

  newRow.appendChild(countryData);



  // add score
  let scoreData = document.createElement("td");;
  scoreData.innerHTML = data.score;

  newRow.appendChild(scoreData);

  

  // add to table

  table.appendChild(newRow);





  

}

async function getRankings(tableElement, startFlag=null, readLimit=10,) {
  let q;
  

  if (startFlag) {
    q = query(flagsRef, 
      orderBy("score", "desc"),
      startAfter(startFlag),
      limit(readLimit)
    );
  }

  else {
    q = query(flagsRef, 
      orderBy("score", "desc"),
      limit(readLimit)
    );
  }






  const qSnapshot = await getDocs(q);
  const qDocs = qSnapshot.docs;
  let rank = tableElement.childElementCount + 1;
  // qSnapshot.forEach(async (doc) => {
  
  for (let i = 0; i < qDocs.length; i++) {
    let document = qDocs[i]
    await addRankToTable(rankTable, document.data(), rank);
    rank++
  }



  let last = qDocs.slice(-1)[0]
  
  return last
  
}





async function main() {
  let last = await getRankings(rankTable);
  let lastRank = 0
  console.log(nextPageBtn);
  nextPageBtn.addEventListener("click", async function() {
    
    if (last) { // dont run if at end of db
      last = await getRankings(rankTable, last);
    }
  });

}

main()









