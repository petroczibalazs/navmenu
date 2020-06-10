module.exports = {

    elGroupRegExpText : "(?:^|\\n)((?:(?!<table[^>]*?class=\"[^\"]*?libid_\\d{3}_\\d{3})(\\w|\\W))*)(<table[^>]*?class=\"[^\"]*?)(libid_\\d{3}_\\d{3})(_(?:DIV|TD|BOTH)[^>]*>)((?:\\w|\\W)*?)(<\\\!--\\s*libid_\\d{3}_\\d{3}[\\w\\W]*?VÉGE\\s*-->[\\w\\W]*?</table>)",
    /*
    $1 = az elem csoport előtt minden kód;  
    $3 = az elem csoport nyitó table tagjének az eleje; 
    $4 = a nyitó table tagben kifejezetten CSAk a libid azonosító!; 
    $5 = az elem csoport nyitó table tagjéből a libid rész után eső szakasz;
    $7 = az elem csoport összes többi része --- nyilván a $4-t majd jól lehet később használni
    */
    edContainerRegExpText : "^((?:(?!<div\\s+class=\"[^\"]*?ed-container)(?:\\w|\\W))*)(<div\\s+class=\"[^\"]*ed-container[^\"]*?\"\\s*>)((?:(?!</div>)(?:\\w|\\W))*)(</div>)",
    /*
    $1 = az ed-container nyitó div tag előtt bármi;
    $2 = a teljes ed-container nyitó div tag ; 
    $3 = az ed-container nyitó - záró tagek között minden kód;
    $6 = az ed-container záró div tag
    */
    markersRegExpText : "^((?:(?!<section\\s+data[-]elem=\"marker\")(?:\\w|\\W))*)(<section)((?:\\w|\\W)+?)(</section>)",
    /*
    $1       = a marker helyőrző előtt minden kód;
    $2,$3,$4 = a marker helyőrző részei
    */
    bodyContentRegText : "(<body[^>]*?>)((?:(?!helper)(?:\\w|\\W))*)([^>]*?>)((?:(?!</div>[\\n\\s]*</body>)(?:\\w|\\W))*)(</div>[\\s\\n]*</body>)",
    /*
    $1,$2,$3 = a nyitó body tag, és az azt követő helper classnevet viselő nyitó div tag;
    $5       = a záró helper div tage, és a záró body tag
    */
    cleanUpRegExpText : "^((?:(?!@@@@####__PLACEHOLDER\\d+__@@@@####)(?:\\w|\\W))*)(@@@@####__PLACEHOLDER\\d+__@@@@####)",
    /*
    $1 = a HTML tartalomban maradt adott elem csoport helyőző előtt lévő összes kód;
    $2 = a HTML helyőrző kódja
    */
    imageRegExpText : "(^|\\n)((?:(?!<img)(?:\\w|\\W))*)(<img)((?:\\w|\\W)+?)(src=\")([^\"]*?)(\")",
    /*
    $1 = a string kezdete
    $2 = az adott elem csoportban az <img> taget megelőző kódrészek;
    $3 = az <img tag legeleje
    $4 = az image tagen belül az src attribútumot megelőző részek
    $5 = az src attribútum neve az =" (egyenlőség jel + nyitó idézőjellel)
    $6 = a kép src attribútumába írt érték
    $7 = az src attribútum értékét követő, záró idézőjel
    */
   
   commentedLinkRegExpText : "<\\\!--[\\n\\s]*(<link\\s*rel=\"stylesheet\"(\\w|\\W)*?>)[\\n\\s]*-->",
   linkRegExpText          : "<link\\s*rel=\"stylesheet\"(\\w|\\W)*?>",
   LINK                    : "<link rel=\"stylesheet\" href=\"css/style.css\">",
   INACTIVE_LINK           : "<!--\n <link rel=\"stylesheet\" href=\"css/style.css\">\n-->",

   OLStylesheetRegExpText : "^(((?!<\\\!--\\s*\\\[if[^\\\]]+\\\]\\s*>[\\s\\n]*<style\\s+type=\"text/css\")(\\w|\\W))*)(<\\\!--\\s*\\\[if[^\\\]]+\\\]\\s*>[\\s\\n]*<style(\\w|\\W)*?<\\\!\[endif\\\][\\s\\n]*-->)",
/*
$1 = a feltételes kommentbe tett stylesheet előtt minden; 
$4 = az egész feltételes megjegyzésbe tett stylesheet 
*/
    styleSheetRegExpText : "^(((?!<style\\s+type=\"text/css\")(\\w|\\W))*)(<style(\\w|\\W)*?</style>)",
/*
$1 = minden ami a stylesheetet megelőzi; 
$4 = a teljes stylesheet 
*/
    metaRegExpText : "^(((?!<meta\\s+name=\"edima-json\")(\\w|\\W))*)(<meta\\s+name=\"edima-json\"(\\w|\\W)*?>)",
/*
$1 = minden ami a speciális meta tag előtt van; 
$4 = a teljes speciális meta tag 
*/

    charsetRegExpText : "^((?:(?!@charset)(\\w|\\W))*)@charset\\s+\"UTF-8\";",
    sourceMappingRegExpText : "^((?:(?!\/\\\\*\\s*#\\s*sourceMappingURL)(\\w|\\W))*)\/\\\*\\s*#\\s*sourceMappingURL[^*]*?\\\*\/",
    mediaRegExpText : "^((?:(?!@media)(\\w|\\W))*)(@media\\s+\\w+?\\s+and\\s+)(\\\([^:]+?:[^)]+\\\)[\\s\\n]*\\\{)((?:(?!\\\}[\\n\\s]*\\\})(\\w|\\W))*)(\\\}[\\s\\n]*\\\})",
/*
$1 = minden, ami a media query előtt van; 
$3 = media at rule, és media type részek; 
$4 = media condition rész; 
$5 = a media query-n belüli style declarations; 
$7 = a dupla záró kapcsos zárójelek
*/
    mediaIGNORERegExpText : "^((?:(?!@media\\s+IGNORE)(\\w|\\W))*)(@media\\s+IGNORE[^{]+)\\\{[\\s\\n]*\/\\\*[\\s\\n]*((?:(?!<\/style>)(\\w|\\W))*)(<\/style>)[\\s\\n]*\\\*\/[\\s\\n]*\\\}",
/*
$1 = az összes az IGNORE media query előtti rész; 
$4,$6 = az ignore stylesheet részei
*/
    keyFramesRegExpText : "^((?:(?!@keyframes\\s+TWIGES\\s*)(\\w|\\W))*)(@keyframes\\s+TWIGES[\\s\\n]*\\\{[\\s\\n]*from[\\s\\n]*\\\{[\\s\\n]*\/\\\*\\\![\\s\\n]*)(<meta\\s+name=\"edima-json\")((?:(?!\\\*\/)(\\w|\\W))*)((?:(?!\\\}[\\s\\n]*\\\})(\\w|\\W))*)\\\}[\\s\\n]*\\\}"
/*
$1 = minden, ami a @keyframes rule előtt szerepel; 
$3 = a @keyframes at rule; 
$4,$5 = a bele tett meta tag
*/
}