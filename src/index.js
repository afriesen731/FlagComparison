// npm init -y to create package.json
// add "build": "webpack" to "scripts": in json
// run to add webpack "npm i webpack-cli -D"
// create "webpack.config.js" in main project firectory
// recreate content based on the one in this project
// "npm run build" to bundle
// add "<script src="bundle.js" defer></script>" to index
// set up at firebase




let fileStuff = `Afghanistan;5;
Albania;3;
Algeria;4;
American-Samoa;6;
Andorra;3;
Angola;4;
Anguilla;1;
Antigua-Barbuda;1;
Argentina;2;
Australia;6;
Austria;3;
Bahamas;1;
Bahrain;5;
Bangladesh;5;
Barbados;1;
Belgium;3;
Belize;1;
Benin;4;
Bermuda;1;
Bhutan;5;
Bolivia;2;
Botswana;4;
Brazil;2;
Brunei;5;
Bulgaria;3;
Burkina;4;
Burma;5;
Burundi;4;
Cameroon;4;
Canada;1;
Cape-Verde-Islands;4;
Cayman-Islands;1;
Central-African-Republic;4;
Chad;4;
Chile;2;
China;5;
Colombia;2;
Comorro-Islands;4;
Congo;4;
Cook-Islands;6;
Costa-Rica;1;
Cuba;1;
Cyprus;3;
Czechoslovakia;3;
Denmark;3;
Djibouti;4;
Dominica;1;
Dominican-Republic;1;
Ecuador;2;
Egypt;4;
El-Salvador;1;
Equatorial-Guinea;4;
Ethiopia;4;
Faeroes;3;
Falklands-Malvinas;2;
Fiji;6;
Finland;3;
France;3;
French-Guiana;2;
French-Polynesia;6;
Gabon;4;
Gambia;4;
Germany-DDR;3;
Germany-FRG;3;
Ghana;4;
Gibraltar;3;
Greece;3;
Greenland;1;
Grenada;1;
Guam;6;
Guatemala;1;
Guinea;4;
Guinea-Bissau;4;
Guyana;2;
Haiti;1;
Honduras;1;
Hungary;3;
Iceland;3;
India;5;
Indonesia;6;
Iran;5;
Iraq;5;
Ireland;3;
Israel;5;
Italy;3;
Ivory-Coast;4;
Jamaica;1;
Japan;5;
Jordan;5;
Kenya;4;
Kiribati;6;
Kuwait;5;
Laos;5;
Lebanon;5;
Lesotho;4;
Liberia;4;
Libya;4;
Liechtenstein;3;
Luxembourg;3;
Madagascar;4;
Malawi;4;
Malaysia;5;
Maldives;5;
Mali;4;
Malta;3;
Mauritania;4;
Mauritius;4;
Mexico;1;
Federated States of Micronesia;6;
Monaco;3;
Mongolia;5;
Morocco;4;
Mozambique;4;
Nauru;6;
Nepal;5;
Netherlands;3;
New-Zealand;6;
Nicaragua;1;
Niger;4;
Nigeria;4;
Niue;6;
North-Korea;5;
Norway;3;
Oman;5;
Pakistan;5;
Panama;2;
Papua-New-Guinea;6;
Paraguay;2;
Peru;2;
Philippines;6;
Poland;3;
Portugal;3;
Qatar;5;
Romania;3;
Rwanda;4;
San-Marino;3;
São Tomé and Príncipe;4;
Saudi-Arabia;5;
Senegal;4;
Seychelles;4;
Sierra-Leone;4;
Singapore;5;
Solomon-Islands;6;
Somalia;4;
South-Africa;4;
South-Korea;5;
Yemen;5;
Spain;3;
Sri-Lanka;5;
Saint-Kitts-and-Nevis;1;
Saint-Lucia;1;
Saint-Vincent-and-Grenadines;1;
Sudan;4;
Suriname;2;
Eswatini;4;
Sweden;3;
Switzerland;3;
Syria;5;
Taiwan;5;
Tanzania;4;
Thailand;5;
Togo;4;
Tonga;6;
Trinidad-and-Tobago;2;
Tunisia;4;
Turkey;5;
Tuvalu;6;
United Arab Emirates;5;
Uganda;4;
United-Kingdom;3;
Uruguay;2;
United States;1;
Vanuatu;6;
Vatican-City;3;
Venezuela;2;
Vietnam;5;
Samoa;6;
Zambia;4;
Zimbabwe;4;`
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
  updateDoc
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

