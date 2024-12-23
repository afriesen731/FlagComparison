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


import '../scss/styles.scss'

import 'bootstrap';
import 'dotenv'
import {Flag} from "../js/structures.js"

import {
  flagsRef,
} from "../js/firebase.js"


import { 
  getDocs,
  query,
  orderBy,
  limit, 
  startAfter
} from "firebase/firestore";










const rankTable = document.getElementById("flag-rankings");
const nextPageBtn = document.getElementById("next-page-btn")

/**
 * Adds a ranking row to the table displaying flag rankings.
 * 
 * @param {HTMLElement} table - The HTML table element to append the new row to.
 * @param {Flag} flag - The Flag instance representing the flag data.
 * @param {number} rank - The ranking position for the flag.
 */
async function addRankToTable(table, data, rank) {
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

/**
 * Retrieves flag rankings from the database and adds them to the ranking table.
 * 
 * @param {HTMLElement} tableElement - The table element where flag rankings will be displayed.
 * @param {Object|null} startFlag - The document snapshot of the last flag from the previous page of results, used for pagination.
 * @param {number} readLimit - The maximum number of flags to retrieve in one query (default is 10).
 * @returns {Object} - The last flag document snapshot in the current set, used for pagination.
 */
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
  for (let i = 0; i < qDocs.length; i++) {
    let document = qDocs[i]
    await addRankToTable(rankTable, document.data(), rank);
    rank++
  }



  let last = qDocs.slice(-1)[0]
  
  return last
  
}




/**
 * Main function to initialize the rankings table and handle pagination with the "Next Page" button.
 */
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









