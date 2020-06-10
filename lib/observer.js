const { getRoot } = require('./setRoot');
const baseFolder = process.cwd() + '/src/' + getRoot() + '/dist';
const scssTargetFile = baseFolder + '/scss/style.scss';
const fs = require('fs');
let exists = fs.existsSync(scssTargetFile);

if(exists){
const start_msg = 
`\n[${new Date().toLocaleString()}] 
Watching for file changes on: ${scssTargetFile}\n---------- ------- --------
Do not forget to stop watching this file by pressing (Ctrl+ C) two times in the end!
---------- ------- --------`;
console.log(start_msg);


/*
* --------------------------------------------------------------------------
* ------------- A STYLE.SCSS FILE VÁLTOZÁSAIT FIGYELŐ KÓDRÉSZ --------------
* --------------------------------------------------------------------------
*/

/*fs.watch is fast and efficient because it relies on the native op system events to follow changes in files
but the operating system generates a number events while saving a file and I want to let the program 
only to react on each once.
*/
  let timer = null;
  const scssChange = require('./scssChange');  
  /*Elmentetem a style.scss fájl induló állapotát!*/
  scssChange(scssTargetFile, true);

  fs.watch(scssTargetFile, (eventName, fileName) => {    

    if(timer){
      return;
    }
    timer = setTimeout(function(){
      timer = false;
      scssChange(scssTargetFile, false);
    }, 100); 
  });
};

/*
* --------------------------------------------------------------------------
* ---- A BASEFOLDERBEN AZ ELEMENT-GROUPS MAPPA VÁLTOZÁSAIT FIGYELŐ KÓDRÉSZ -
* --------------------------------------------------------------------------
*/

let mapTimer = null;
const tranzit = baseFolder + '/tranzit';
const baseFolderChange = require('./baseFolderChange');  

/*Elmentetem a tranzit folder kiindulási állapotát! (ami valószínűleg üres induláskor..)*/

baseFolderChange(tranzit, true);

fs.watch(tranzit, (eventName, folderName) => {    
  if(mapTimer != null){
    return;
  }
   mapTimer = setTimeout(function(){
    console.log('eventname: ' + eventName, folderName);
    mapTimer = null;
    baseFolderChange(tranzit, false, eventName);
  }, 300);
});


