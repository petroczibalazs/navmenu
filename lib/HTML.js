const fs = require('fs');
const settings = require('./readWriteSettings');
// const baseFolder = settings('baseFolder');
const { getRoot } = require('./setRoot');
const baseFolder = process.cwd() + '/src/' + getRoot() + '/dist';

let html_content = "";
let css_content = "";
console.log('BASEFOLDER >>> ' + baseFolder);

/*  --------------- ----------------------------- ---------------------- -------------------------------
-----------------------------------------   REG TEXTS  ----------- ------------------------------- 
--------------- ----------------------------- ---------------------- ----------------------------------- */
const {
        elGroupRegExpText,
        edContainerRegExpText,
        markersRegExpText,
        bodyContentRegText,
        cleanUpRegExpText,
        imageRegExpText,
        commentedLinkRegExpText,
        linkRegExpText,
        OLStylesheetRegExpText,
        styleSheetRegExpText,
        metaRegExpText,
        charsetRegExpText,
        sourceMappingRegExpText,
        mediaRegExpText,
        mediaIGNORERegExpText,
        keyFramesRegExpText,
        LINK,
        INACTIVE_LINK

} = require('./regTexts');

const regContainerTexts = [
  { mit: elGroupRegExpText,       melyik: "element_group"},
  { mit: markersRegExpText,       melyik: "markers"},
  { mit: edContainerRegExpText,   melyik: "ed_container"},
  { mit: cleanUpRegExpText,       melyik: "clean_up"}
];

let reg   = null,
    cur   = '',
    copy  = '',
    temp  = '',
    match = null,
    leng  = 0;

var STORAGE = {};
var IMAGES  = {};

const regTexts = [
  { mit: elGroupRegExpText,       melyik: "element_group"}  
];

const imgTexts = [
  { mit: imageRegExpText,         melyik: "images"}
];

let queries_rules = ""; /* ide gyűjtöm, átmenetileg, az index.css fájlból kigyűjtött media query-ket, és szabályokat*/
let meta_tags     = ""; /* ide gyűjtöm, átmenetileg, az index.css fájlból kigyűjtött speciális meta tageket */
let ignore_sheet = '';  /* ide mentem az ignore stylesheet kódját az index.css fájlból*/

let FIRST_STYLESHEET = false;
let curRegTexts = [],
    branch      = ''; /*konkrétan nem használom jelenleg a kódban sehol 
    * -> még egy beépített szintet jelent, ha később tovább kell valamit
    * esetleg differenciálni, anélkül, hogy alapjában át kelljen írni a kód logikáját!
    */

let elGroups = [];
let elGroupFolders = fs.readdirSync(baseFolder + '/element-groups'); /*az aktuális levél, vagy kreatív mappa alatt az elem csoportokat tartalmazó folder*/
let scssEntries = fs.readFileSync(baseFolder + '/scss/style.scss', 'utf8'); /*az aktuális levél, vagy kreatív mappa alatti központi scss fálj tartalma*/
let contents = []; /*ebben tárolom az index.css.html - ben, az elem csoportok és az ed-containerek viszonylatát kifejező helyőrzőket*/

let COUNTER   = 0,
    COUNTER_1 = 0,
    COUNTER_2 = 0;

const resetValues = () => {
  html_content = fs.readFileSync(baseFolder + '/index.css.html', 'utf8');
  cur = html_content;  
  COUNTER = 0;
  COUNTER_1 = 0;
  COUNTER_2 = 0;
  contents = [];
  STORAGE = {};
  IMAGES = {};
};

/*IMAGE MANIPULATION METHODS*/

const importImg = (libid) => {
  libid = libid.indexOf('libid') > -1 ? libid.replace(/_*libid_*/, '') : libid;

  let path = '';

  let pos = elGroupFolders.findIndex((folderName, index) => {
      return folderName.indexOf(libid) > -1;
  });

  if (pos < 0) {
      console.log("Ehhez az elem csoporthoz nem tartozik tényleges mappa, ahonnan be tudnám tölteni a hozzá tartozó képeket! " + libid);
      return;
  } else {
      path = elGroupFolders[pos];
  }

  let stats = fs.statSync(baseFolder + '/element-groups/' + path + '/pics');
  let isDir = stats.isDirectory();

  if (isDir) {
      fs.readdir(baseFolder + '/element-groups/' + path + '/pics', (err, files) => {
          if (err) {
              console.log("Hiba történt ennek a foldernek az olvasásakor: " + baseFolder + '/element-groups/' + path + '/pics');
          } else {
              files.forEach((file) => {
                  fs.copyFile(baseFolder + '/element-groups/' + path + '/pics/' + file, baseFolder + '/' + file, (err) => {
                      if (err) {
                          console.log('Nem sikerült bemásolni ezt a file-t: ' + baseFolder + '/element-groups/' + path + '/pics/' + file);
                      }
                  });
              });
          }
      });
  } else {
      console.log("Nincs ilyen folder: " + baseFolder + '/element-groups/' + path + '/pics');
  }

};

const saveImage = (libid, path) => {

  return new Promise((resolve, reject) => {

      libid = libid.indexOf('libid') > -1 ? libid.replace(/_*libid_*/, '') : libid;
      path = path.replace(/(^\/+|\/+$)/g, '');

      if (path.indexOf('element-groups') == -1 && path.indexOf('libid') == 0) {
          path = path.replace(/libid/, 'element-groups/libid');
      }

      let index = contents.findIndex((placeholder) => {
          if (placeholder.indexOf('PLACEHOLDER') > -1) {
              return STORAGE[placeholder].id.indexOf(libid) > -1;
          } else {
              return false;
          }
      });
      if (index < 0) {
          reject('This element group - ' + libid + ' does not exists - Cannot save the image files for it!: ');
      } else {
          let placeholder = contents[index];
          let pics = STORAGE[placeholder].pics;

          try {

              let stats = fs.statSync(baseFolder + '/' + path + '/pics');
              if (!stats.isDirectory()) {
                  console.log("Nincs ilyen mappa, ahová az elem csoporthoz tartozó képeket menthetném: " + baseFolder + '/' + path + '/pics');
                  reject("Nincs ilyen mappa, ahová az elem csoporthoz tartozó képeket menthetném: " + baseFolder + '/' + path + '/pics');
              }
          }
          catch (err) {
              console.log(err);
              reject(err);
          }


          fs.readdirSync(baseFolder + '/' + path + '/pics').forEach((item) => {
              if (item.indexOf('.png') > -1 || item.indexOf('.jpg') > -1 || item.indexOf('.gif') > -1) {
                  fs.unlinkSync(baseFolder + '/' + path + '/pics/' + item);
              }
          });

          fs.readdirSync(baseFolder).forEach((item) => {

              let stats = fs.statSync(`${baseFolder}/${item}`);

              if (stats.isFile(baseFolder + '/' + item) && pics.includes(item)) {
                  fs.copyFile(baseFolder + '/' + item, baseFolder + '/' + path + '/pics/' + item, (err) => {

                      if (err) { reject(err) }
                      else {
                          let ext = item.substr(item.lastIndexOf('.'));
                          let name = item.substring(0, item.lastIndexOf('.'));
                          name = name.match(/_+\d{3}_\d{3}/) ? name.replace(/_+\d{3}_\d{3}/, '') : name;
                          name = `${name}__${libid}${ext}`;
                          fs.renameSync(baseFolder + '/' + path + '/pics/' + item, baseFolder + '/' + path + '/pics/' + name);
                      }
                  });
              }
          });
      }
      resolve(libid);
  });
};

const deleteImage = (libid) => {
  libid = libid.indexOf('libid') > -1 ? libid.replace(/_*libid_*/, '') : libid;

  let index = contents.findIndex((placeholder) => {
      if (placeholder.indexOf('PLACEHOLDER') > -1) {
          return STORAGE[placeholder].id.indexOf(libid) > -1;
      } else {
          return false;
      }
  });
  if (index < 0) {
      console.log('Nem létezik ilyen azonosítójú elem csoport, ezért a hozzá tartozó képfájlokat sem tudom törölni: ' + libid);
  } else {

      let placeholder = contents[index];
      let pics = STORAGE[placeholder].pics;

      fs.readdir(baseFolder, (err, items) => {
          if (err) {
              console.log('Hiba történt a ' + baseFolder + " olvasásakor!");
          } else {
              items.forEach((item) => {
                  let stats = fs.statSync(`${baseFolder}/${item}`);
                  if (stats.isFile(baseFolder + '/' + item) && pics.includes(item)) {
                      fs.unlinkSync(baseFolder + '/' + item);
                  }
              });
          }
      });
  }
};
const purgeImages = () => {
  /* Removes unused images from the current dist folder*/

  console.log('PURGE IMAGES');

  let allImages = [];
  let keys = Object.keys(STORAGE);

  keys.forEach((key) => {
      allImages = allImages.concat(STORAGE[key].pics);
  });

  fs.readdirSync(baseFolder).forEach((file) => {
      if ((file.indexOf('.png') > -1 || file.indexOf('.jpg') > -1 || file.indexOf('.gif') > -1) && !allImages.includes(file)) {
          fs.unlinkSync(baseFolder + '/' + file);
      }
  });
};

/*HELPER METHODS*/
const getTemplate = (libid, color, bgColor, height, lineHeight, fontSize) => {

  let template = `<section data-elem="marker" style="height: ${height}; line-height: ${height}; color: ${color}; background-color: ${bgColor}; text-align:center; ">
  <span style="font-size: ${fontSize}; vertical-align: middle;">${libid}</span>
  </section>`;
      return template;
  };

const getPlaceHolder = () => {
    let PLACEHOLDER = `__PLACEHOLDER${COUNTER}__`;
    COUNTER++;
    return PLACEHOLDER;
  };

const getStyleSheet = (contents) => {
    let sheet = `\n<style type="text/css">\n${contents}\n</style>`;
    return sheet;
  };

const getElGroupPlaceHolder = () => {
  let t = `__PLACEHOLDER${COUNTER_1}__`;
  COUNTER_1++;
  return t;
};
const getEdContainerPlaceHolder = (dir) => {  
  let j = `__EDCONTAINER: (${COUNTER_2}) ${dir} `;
  if(dir == "END"){
      COUNTER_2++;
  }
  return j;
};
/* --- CORE METHODS ----- */
const fillPlaceholders = () => {
  for (let j in STORAGE) {
    if (html_content.indexOf(j) > -1) {
      html_content = html_content.replace(j, `\n${STORAGE[j]}\n`)
    }
  }
};
const insertCSSContent = (CSSContent) => {

  let index = html_content.indexOf(LINK);
  if (index > -1) {
    html_content = html_content.substring(0, index) + CSSContent + LINK + html_content.substr(index + LINK.length);
  }
};

const toggleLink = (bool) => {
  /*
  * a biztonság kedvéért először mindenképpen törölni kell
  * az esetlegesen az index.css.html fájlban lévő
  * kikommentelt <link taget
  */
    let reg = new RegExp(commentedLinkRegExpText);
    html_content = html_content.replace(reg, LINK);
  
    if (!bool) {
      reg = new RegExp(linkRegExpText);
      html_content = html_content.replace(reg, INACTIVE_LINK);
    }
  };


const exportElementGroups = () => {

  let keys = Object.keys(STORAGE);

    const doExports = (id) => {
      return new Promise((resolve, reject) => {

        correctSRCAttrValues(id)
        .then((id) => {
          return export_HTML(id)
        })
        .then((id) => {
          
            let index = elGroupFolders.findIndex((link) => {
              return link.indexOf(id) > -1
            });
    
            if(index > -1){
            return saveImage(id, 'element-groups/' + elGroupFolders[index]);
            }else{
            console.log("Nem tartozik ehhez a elem csoport azonosítóhoz mappa: " + id);
            return null;
            }
            resolve(true);
        });
      });
     
    };  


  keys.forEach((key) => {
      let id = STORAGE[key].id;
      doExports(id); 
  });
};
const export_HTML = (id = null) => {

  /* Minden egyes, az oldalon kint lévő elem csoporthoz 
   * KELL legyen egy neki megfelelő elem csoport mappa,
   * enélkül nem kezdi el menteni az elem csoportokat!
   * Ha barbár módon, kézzel bele babrált valaki, 
   * és bele copy - pastelt valami elem csoport HTML részt,
   * akkor azt javítsa is ki!
  */
 
  return new Promise((resolve, reject) => {
    let pos = -1;
    let missing = null;

    for(let key in STORAGE){

      let libid = STORAGE[key].id;
      pos = elGroupFolders.findIndex((folderName, index) => {
        return folderName.indexOf(libid) > -1;
      });

      if(pos < 0){
        missing = STORAGE[key].id + STORAGE[key].type;
        break;
      }   
  };

if(pos < 0){
  reject('Ehhez az elem csoporthoz nem tartozik mappa! -- ' + missing + '\n' + 'Egyik elem csoport kódját sem mentettem!');
}
else{

    for(let key in STORAGE){

      let entry = STORAGE[key];

      if(id != null && entry.id != id){
        continue;
      }
      pos = elGroupFolders.findIndex((mapName, index) => {
        return mapName.indexOf(entry.id) > -1;
      });
      let theGroupMap = elGroupFolders[pos];

      let filePath = baseFolder + '/element-groups/' + theGroupMap + '/' + entry.type + '/index.css.html';
      let exists = fs.existsSync(filePath);
      if(exists){
        fs.writeFileSync(filePath, entry.markup);
      }else{
        reject('Valamiért nem sikerült kimenteni a(z) ' + id + ' azonosítójú elem csoporthoz tartozó HTML kódot!');
      }
  };
  resolve(id);
}
});
};
const delete_HTML = (libid) => {

  let index = contents.findIndex((placeholder) => {
    if(placeholder.indexOf('PLACEHOLDER') > -1){
      return STORAGE[placeholder].id.indexOf(libid) > -1;
    }else{
      return false;
    }
  });
  if(index < 0){
    console.log('No element group exists with this libid: ' + libid);
  }else{

    let p = getMarkerScheme();
    updateHTMLContent({'markers': p.markers, 'params': p.params, 'index' :index});
  }
};
const updateEdContainerEntries = () => {
/*A style.scss fileban ugyan oda helyezi / mozgatja az ed-container kezdő - záró
* helyőrzőket, mint ahogy azok számban, és pozícióban az index.css.html-ben találhatók,
* ezáltal az ed-containerek számát, és helyzetét mindkét helyen szerkeszteni,
* változtatni lehet!
*/
    scssEntries = scssEntries.split('\n').filter((value) => {
      return value && value.indexOf('__EDCONTAINER') == -1;
    });
/*Tehát kiszedi az összes ed-contaner helyőrzőt a sty.scss fájl sorai közül*/

    const getPos = (libid) => {
      return scssEntries.findIndex((value) => {
        return value.indexOf(libid) > -1;
      });
    };

    let pos = null;

      for(let i = 0, length = contents.length; i < length; i++){  

      if(contents[i].indexOf('START') > -1){
        /* Ha a html fájlban a nyitó ed-container helyőrző után egy elem csoport helyőrző jön .. */
          if(contents[i + 1] && contents[i + 1].indexOf('PLACEHOLDER') > -1){
            let libid = STORAGE[contents[i + 1]].id;
            pos = getPos(libid);
        /* .. ennek libid-je alapján az ed-container nyitó helyőrző sort a beazonosított elem csoport sora elé helyezi a style.scss fájl soraiban  */
            scssEntries.splice(pos, 0, `\n/* ----- ${contents[i]} ----- */`);
          }
      }else if(contents[i].indexOf('END') > -1){
          if(contents[i - 1] && contents[i -1].indexOf('PLACEHOLDER') > -1){
            let libid = STORAGE[contents[i - 1]].id;
            pos = getPos(libid);
            scssEntries.splice(pos + 1, 0, `/* ----- ${contents[i]} ----- */\n`);
          }
      }
  };
};
const getMarkerScheme = () => {
/*kikeresi a settings.json fájlba elmentett marker beállításokat, ha vannak ilyenek*/
  let markers = settings("markers");
  let scheme  = settings("markerScheme");
  return {
            "markers": markers,
            "params" : scheme        
          }
};
const changeMarkers = (option, params) => {
  let bool = option == 'show'? true: false;
  settings("markers", bool);
  settings("markerScheme", params);
  updateHTMLContent({"markers": bool, "params": params});
};
const collectImgNames = () => {
    const keys = Object.keys(STORAGE);
    curRegTexts = imgTexts;
  
    for(let key of keys){
      /*A cur változó aktuális értékével kezd el dolgozni a transform metódus!*/
      cur = STORAGE[key].markup;
      transform(STORAGE[key]);
    }
};
const updateHTMLContent = ({html = '', index = null, markers = false, params:p = null, finish = false}) => {
console.log('*** UPDATE HTML CONTENT');
/* Frissíti az index.css.html fájl tartalmát,
*  egyben lehetővé teszi az index paraméterrel hivatkozott
*  elem csoport törlését, valamint új elem csoport kódjának
*  az importját is. Minden féle változtatás befejező
*  lépéseként ezt a metódust hívom.
*/
let reg = new RegExp(bodyContentRegText);
html_content = html_content.replace(reg, '$1$2$3' + '\n__BODY-CONTENT__\n' + '$5');

contents.forEach((value, i) => {
  /*Így törli a megadott indexű elem csoportot*/

  if(index != null && i === index){
    contents[i] = '';
  }else{

      if(value.indexOf('__EDCONTAINER') > -1){
        if(value.indexOf('START') > -1){
          contents[i] = '<div class="ed-container">';
        }else{
          contents[i] = '</div>';
        }
      }else if(value.indexOf('PLACEHOLDER') > -1){
        let marker = (markers != false && p!= null)? getTemplate(STORAGE[contents[i]].id, p.color, p.bgColor, p.height, p.lineHeight, p.fontSize) + '\n' : '';
        contents[i] = marker + (finish === true ? STORAGE[contents[i]].markup_in_letter : STORAGE[contents[i]].markup);

      }else if(value.indexOf('NEW-ELEMENT-GROUP') > -1){
        /*Így importálja, és illeszti be egy adott pozícióba egy új elem csoport kódját*/ 
        let id = html.match(/libid_\d{3}_\d{3}/)[0];
        let marker = (markers != false && p!= null)? getTemplate(id, p.color, p.bgColor, p.height, p.lineHeight, p.fontSize) + '\n' : '';
        contents[i] = marker + html;
      }
  }
});
  html_content = html_content.replace(/__BODY[-]CONTENT__/, contents.join('\n'));
  fs.writeFileSync(baseFolder + '/index.css.html', html_content);
};

const reorderHTMLContent = (scssEntries, newLibid = null) => {

/* 
*  scssEntries = a style.scss fájlból az elem csoportokra mutató sorok
*  A style.scss file-ban lévő bejegyzéseket alapul véve, 
*  az abban éppen aktuális állapotnak megfelelő sorrenbe,
*  és helyzetbe rendezi az index.css.html fájlban az elem csoportokat,
*  valamint az ed-container diveket. 
*  Továbbá, ugyan ennek a mechanizmusnak a kihasználásával
*  megoldom az új elem csoportok importjának ez első részét is, 
*  és az új elem csoporthoz helyőrzőt szúrok be!
*/
  let keys = Object.keys(STORAGE);
  let libids = [];

  for(key of keys){
    libids.push(STORAGE[key].id);
  }
  
  let scssLibids = scssEntries.filter(value => value.indexOf('libid') > -1);


if(scssLibids.length > libids.length){
/* Ilyenkor vagy hiba van, vagy tényleg importálni akar egy új elem csoportot */
  let extraScssLibid = scssLibids.filter(value => !libids.includes(value)); 
  if(extraScssLibid != newLibid){
     console.log("Ez(ek) az elemcsoport(ok): \n-----" + extraScssLibid.join('-----\n-----') + "-----\ncsak a style.scss fájlban szerepelnek a index.css.html-ben nem!")
     return; 
  }
}else if(libids.length > scssLibids.length){
  let extraLibid = libids.filter(value => !scssLibids.includes(value));
  console.log("Ez(ek) az elemcsoport(ok): \n-----" + extraLibid.join('-----\n-----') + "-----\ncsak az index.css.html fájlban szerepelnek a style.scss-ben nem!")
  return;
}
  /* idáig az index.css.html fájlban minden elem csoportot 
  *  megfeleltettem egy neki megfelelő libid sorral a style.scss fájlban,
  *  most az index.css.html fájlban lévő elem csoport helyőrzőkre cserélem
  *  az scssEntries tömbben a nekik megfelelő sorokat, hogy aztán a STORAGE-ból
  *  ki tudjam íratni az adott helyőrzőkhöz tartozó HTML markup kódokat.
  *  Figyeld meg, hogy így az elem csoportok, és az ed-containerek kiíratásához is
  *  a style.scss fájlban lévő helyőrzők sorrendjét veszi alapul!
  */
    scssEntries.forEach((sor, i) => {
      if(sor.indexOf('libid') > -1){
        let index = libids.findIndex((aLibid) => {
          return aLibid == sor;
        });
          if(index > -1){
            scssEntries[i] = keys[index];
          }
          else if(newLibid != null){
/* Ezt kellett biztosítani, hogy itt a feltétel biztosan CSAKIS 
*  az importálni kívánt új elem csoport id-jére teljesülhessen, hogy
*  nincs benne az azonosítója a korábbi állapotnak megfelelő elem csoportokéi között.
*/
          scssEntries[i] = 'NEW-ELEMENT-GROUP';
          }
          else{
            scssEntries[i] = '';
          }
      }      
    });

    contents = scssEntries;
};

const correctSRCAttrValues = (libid, finish = false) => {

  /*
  * A libid argumentum értékének megfelelő libid azonosítójú elem csoportra vonatkozóan: 
  * a.) a basefolder mappában átírja, ill. kiegészíti a hozzá tartózó képek nevét
  * b.) ennek megfelelően korrigálja az elem csoporthoz a STORAGE-ban, a pics tömbben tárolt kép neveket
  * c.) ennek megfelelően korrigálja az elem csoport html kódjában az <img src="" attribútum értékekét,
  * d.) ha a kép nevében szerepel a _keep betoldás, akkor az elem csoport HTML kódjában meg kell tartani a rá mutató hivatkozást
  * e.) a d pontban meghatározott képek kivételével az elem csoport HTML kódjának a megfelelő mappába  történő
  *     kimentésekor HELYŐRZŐ képekre mutató hivatkozásokra cseréli az eredeti képekre történő hivatkozásokat.
  */
    return new Promise((resolve, reject) => {

      let index = contents.findIndex((placeholder) => {
        if(placeholder.indexOf('PLACEHOLDER') > -1){
          return STORAGE[placeholder].id.indexOf(libid) > -1;
        }else{
          return false;
        }
      });
    
      if(index < 0){
        reject('No element group exists with this libid: ' + libid);        
      }else{
        
        let placeHolder = contents[index];
        let elementGroupEntry = STORAGE[placeHolder];
        let pics = elementGroupEntry.pics;
        let html = elementGroupEntry.markup;
        let id   = elementGroupEntry.id.replace(/_*libid_*/, '');
        let html_in_letter = html;
        let pic_dummy = 'https://dummyimage.com/600x400/334d4d/fff/&amp;text= !replace me!';

        for(let i = 0, leng = pics.length; i < leng; i++){
            let pic = pics[i];
            console.log('pics[i]: ' + pics[i]);
            let keep_it = pic.indexOf('_keep') > -1;

              let pic_corrected =  pic.match(/_+\d{3}_\d{3}/) ? pic.replace(/_+\d{3}_\d{3}/, '__' + id) : (pic.substring(0, pic.lastIndexOf('.')) + '__' + id + pic.substr(pic.lastIndexOf('.')));
              
                pic = pic.replace(/\./g, '[.]').replace(/[-]/g, '[-]');
                let reg = new RegExp(pic, 'g');  
          
                html_in_letter = html_in_letter.replace(reg, pic_corrected);
                reg = new RegExp(pic, 'g'); 
                html = html.replace(reg, (finish === true ? keep_it === true ? pic_corrected : pic_dummy : pic_corrected));                 

                fs.renameSync(baseFolder + '/' + pics[i], baseFolder + '/' + pic_corrected);
                let imageName = pics[i].replace(/[.-]/g, '_');
                  
                if(IMAGES[imageName]){
                    IMAGES[imageName]--;
                  }
                if(IMAGES[imageName] > 0){
                  console.log('COPYING IMAGES');
                  fs.copyFileSync(baseFolder + '/' + pic_corrected, baseFolder + '/' + pics[i]);
                }
                pics[i] = pic_corrected;
        }
          elementGroupEntry.markup = html;
          elementGroupEntry.markup_in_letter = html_in_letter;
          elementGroupEntry.pics = pics;          
          resolve(libid);
      }
    });
};

const transform = (storageEntry = null) => {
/* Minden fajta átalakítás, vagy rendezés alapja, az index.css.html fájlban lévő
*  elem csoportok felmérése, a róluk szóló lényeges információk kinyerése, és 
*  elraktározása. Ennek érdekében advanced szöveg feldolgozási teschnikákat használ:
*  mint a placeholderekkel történő kiváltás, és adattárólóba történő adat felvétel,
*  ezért a feldolgozás sorrendje is alapvető fontosságú!
*/

  for (let t = 0; t < curRegTexts.length; t++) {

    reg = new RegExp(curRegTexts[t].mit);

    if (t > 0) {
      cur = copy;
      copy = "";
    }

    while (cur.length > 0) {

      match = cur.match(reg);

      if (match != null) {

        temp = cur.substr(0, match.index + match[0].length);
        leng = temp.length;

        switch (curRegTexts[t].melyik) {

          case "element_group":
              
                let placeholder = getElGroupPlaceHolder();              
                copy += match[1] + "\n@@@@####" + placeholder + "@@@@####";
                STORAGE[placeholder] =  {
                                          'markup'           : match[3] + match[4] + match[5] + '\n' + match[7],
                                          'markup_in_letter' : '',
                                          'type'             : (match[5].match(/^_(\w+)/))[1],
                                          'id'               : match[4],
                                          'pics'             : []
                                        };
            break;

            case "markers":
              /*simán kiszedi az elem csoport markereket*/
              copy += match[1];              
            break;

            case "ed_container":
             if(match[1].indexOf('@@@@####') > -1){
                contents = contents.concat(match[1].split('@@@@####').filter((item) => {
                  return item.trim() != '' && item.indexOf('__PLACEHOLDER') > -1;
                }));
             }   
              contents.push(getEdContainerPlaceHolder('START'));
              contents = contents.concat((match[3].split('@@@@####')).filter((item) => {
                  return item.trim() != '' && item.indexOf('__PLACEHOLDER') > -1;
             }));
             contents.push(getEdContainerPlaceHolder('END'));
             copy += match[1].replace(/@@@@####__PLACEHOLDER\d+__@@@@####/g, "");
            break;

            case "clean_up":
              /*kigyűjti az utolsó záró ed-container UTÁN lévő elem csoportokat,
              * illetve ha egyáltalán nincsenek a kreatívban ed-container divek.
              */
            copy += match[1];
            contents = contents.concat(match[2].split('@@@@####')).filter((item) => {
              return item.trim() != '';
            })
            break;

            case "OLStylesheet":
              let styleSheetPlaceholder = getPlaceHolder();
              copy += match[1] + styleSheetPlaceholder;
              STORAGE[`${styleSheetPlaceholder}`] = match[4];
            break;
  
            case "Stylesheet":
              if (FIRST_STYLESHEET == false) {
                copy += match[1] + match[4];
                FIRST_STYLESHEET = true;
              } else {
                copy += match[1];
              }
            break;
  
            case "metaTag":
              copy += match[1];
            break;
            case "charset":
            case "sourceMap":
                copy += match[1];
            break;
    
            case "media_ignore":
                copy += match[1];
                ignore_sheet = match[4] + match[6];
            break;
    
            case "media_query":
                copy += match[1];
                if (match[4].indexOf('10px') == -1) {
                  queries_rules += '\n' + match[3] + match[4] + match[5] + match[7] + '\n';
                }
            break;
    
            case "keyframes":
                copy += match[1];
                meta_tags += '\n' + match[4] + match[5] + '\n';
            break;

            case "images":
              if(storageEntry != null){
                copy += "";

                if(match[6].match(/\.(jpg|png|gif)$/) && !storageEntry.pics.includes(match[6])){
                  storageEntry.pics.push(match[6]);
                  
                  let name = match[6].replace(/[.-]/g, '_');
                  if(IMAGES[name]){
                    IMAGES[name]++;
                  }else{
                    IMAGES[name] = 1;
                  }                  
                }
              }
            break;
        }        
        cur = cur.substr(leng);
        temp = "";

      } else {
        copy += cur;
        cur = "";
      }
      reg = new RegExp(curRegTexts[t].mit);
    }
  }
};



const action = (option, ...params) => {
/* az egyetlen innen publikussá tett metódus, amellyel kisebb részben
*  a user saját maga, nagyobb részt a package más részei folyamatokat tudnak elindítani.
*/
if(option == "export"){
    /*
    Belsőleg kerül meghmeghívásra, mielőtt kitörölne egy elem csoportot a HTML fájlból
    */
        curRegTexts = regTexts;
        branch = 'export';
        transform();
        export_HTML();
}
else if (option == "saveAll"){

/* --------------------------------------------------------------
* --- A fejlesztés lezárásakor, vagy újra indításakor kiadott parancsra
*   beinduló metódus. Folytatáskor "csak" a fejrészbe bemásolt css részeket
*   távolítja el, és újra aktívvá teszi a linket.
* --- Lezáráskor viszont az összes elem csoportra nézve adat mentéseket végez,
*   a képeket, és az azokra mutató hivatkozásokat is speciálisan kezeli,
*   törli a feleslegessé vált képeket, majd bemásolja a fejrészbe a css fájlból
*   az ide való részeket ..  
----------------------------------------------------------------*/

  const action = params[0];

if(action === 'continue'){

  const devFinish__HTMLregTexts = [
      { mit: OLStylesheetRegExpText,   melyik: "OLStylesheet" },
      { mit: styleSheetRegExpText,     melyik: "Stylesheet"   },
      { mit: metaRegExpText,           melyik: "metaTag"      },
    ];
    curRegTexts = [...devFinish__HTMLregTexts];
    
    resetValues();
    transform();
    html_content = copy;
    fillPlaceholders();
    toggleLink(true);
    html_content = html_content.replace(/[\n\s]+\n/g , '\n');
    fs.writeFileSync(baseFolder + '/index.css.html', html_content);

  }else{

    resetValues();
    curRegTexts = regContainerTexts;
    transform();
    collectImgNames();
  
    const keys = Object.keys(STORAGE);
 /*So long it works syncronously*/ 

    function* callNext(){
  
      for(let key of keys){
  
        let id = STORAGE[key].id; 
  
        let pos = elGroupFolders.findIndex((folderName, index) => {
          return folderName.indexOf(id) > -1;
        });
  
        if(pos < 0){
          console.log("Ehhez az elem csoporthoz nem tartozik mappa: " + id);
          throw new Error("Ehhez az elem csoporthoz nem tartozik mappa: " + id);
  
        }else{    
            let path = elGroupFolders[pos];
            let obj = {'path' : path, 'id' : id};
            yield obj;
        }
      }
    };
  
    function* promiseMaster(libid, path){
      yield correctSRCAttrValues(libid, true);
      yield export_HTML(libid);
      yield saveImage(libid, path);
    };
  
    function runner(gen){
      let promise;
      let obj = gen.next();
  
      if(obj.done === false){
          console.log("GEN.NEXT()");
          promise = obj.value;
          promise
            .then((val) => {        
              runner(gen);
            })
            .catch((err) => {
              gen.throw(err)
            })
          }else{
            console.log("LOGGING - NEW MASTER");
          let next = caller.next();
          if(next.done === false){
            master = promiseMaster(next.value.id, next.value.path);
            console.log(next);
            runner(master);
          }else{
            console.log("Done with all!");
            purgeImages();
            let p = getMarkerScheme();   
            updateHTMLContent({"markers": p.markers, "params": p.params, "finish" : true});
            
/*COPY RELEAVNT PARTS FROM STY.CSS INTO THE HTML FILE*/

      const CSSregTexts = [
        { mit: charsetRegExpText,        melyik: "charset"     },
        { mit: sourceMappingRegExpText,  melyik: "sourceMap"   },
        { mit: mediaIGNORERegExpText,    melyik: "media_ignore"},
        { mit: mediaRegExpText,          melyik: "media_query" },
        { mit: keyFramesRegExpText,      melyik: "keyframes"   }
      ];

      css_content = fs.readFileSync(baseFolder + '/css/style.css', 'utf8');
      resetValues();
      cur = css_content;
      copy = '';
      curRegTexts = [...CSSregTexts];
      transform();

      css_content = (getStyleSheet(copy + '\n' + queries_rules) + '\n' + ignore_sheet + meta_tags);
      css_content = css_content.replace(/\n\s*\n/g, '\n');
      insertCSSContent(css_content);
      toggleLink(false);
      fs.writeFileSync(baseFolder + '/index.css.html', html_content);
    }
}
};  
      let master = null;
      let caller = callNext();
      let first = caller.next();

      console.log("saveAll");
      master = promiseMaster(first.value.id, first.value.path);
      runner(master);

      
}
 
}
else if(option == "maintenance"){
/* egyszerű kis nyilvános metódus,
*  segítségével a style.scss fájlban ugyan oda, és ugyan annyi szépen formázott, 
*  számozott EDCONTAINER jelölőt tesz, hogy azok megfeleljenek az index.css.html
*  fájlban található ed-container blokkoknak. Tehát az ed-container blokkokat
*  közvetlenül az index.css.html fájlban, és a style.scss-ben is szabadon lehet változtatni!
*/
        resetValues();
        curRegTexts = regContainerTexts;
        branch = 'maintenance';
        transform();
        updateEdContainerEntries();
        fs.writeFileSync(baseFolder + '/scss/style.scss', scssEntries.join('\n'));        
}
else if(option == 'import'){
    
/* Belsőleg hívódik meg, amikor a style.scss file-ban leveszed a kommentet az egyik megjegyzésbe tett partial import
  * elejéről.
  * params[0] = az scss entries TÖMB, vagyis a style.scss fájlban az összes aktív elem csoportot jelölő sor
  * params[1] = az scss fájlban legutoljára aktívvá tett elem csoportot jelölő sorban lévő libid azonosító
  * params[2] = az importálni kívánt új elem csoport HTML kódja
*/  
       resetValues();
       curRegTexts = regContainerTexts;
       branch = 'import';
       transform();
       reorderHTMLContent(params[0], params[1]);
       importImg(params[1]);
       let p = getMarkerScheme();   
       updateHTMLContent({"markers": p.markers, "params": p.params, 'html': params[2]});      
}
else if(option == "delete"){

    /* Belsőleg hívódik meg, amikor a user a style.scss fájlban kitöröl,
    * vagy kikommentel egy elem csoportot jelölő sort.
    * params[0] = libid
    * params[1] = path to the folder of the element group to be deleted under the element-groups folder
    */
        resetValues();
        curRegTexts = regContainerTexts;
        transform();
        collectImgNames();

        function* genie(libid, path){
          yield correctSRCAttrValues(libid);
          yield export_HTML(libid);
          yield saveImage(libid, path);
          yield delete_HTML(libid);
        }

        const gen = genie(params[0], params[1]);

        const exec = function(){
          let obj = gen.next();
          if(obj.done === false){
            exec();
          }else{
          }
        }
        exec();
}
else if(option == 'reorder'){
    /* params[0] = a style.scss fájlból az elem csoport helyőrzőket tartalmazó tömb
    *  A style.scss fálj sorainak az átrendezésekor
    *  belsőleg meghívásra kerülő metódus.
    */
        resetValues();
        curRegTexts = regContainerTexts;
        branch = 'reorder';  
        transform();
        reorderHTMLContent(params[0]);
        let p = getMarkerScheme();
        updateHTMLContent({"markers": p.markers, "params": p.params});        
}
else if(option == 'show' || option == 'hide'){
    /*a show - hide értékeket akkor kapja, amikor a user
    * a 'markers' opciót választja
    */   
        resetValues();
        curRegTexts = regContainerTexts;
        branch = 'markers';    
        transform();
        changeMarkers(option, params[0]);    
} 
}

module.exports = action;