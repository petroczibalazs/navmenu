const fs = require('fs');
const path = require('path');

const schemesPath = path.normalize(__dirname + '/marker_schemes.json');
console.log('schemesPath:', schemesPath);

const readWriteSchemes = (key, value) => {
  
  if(key && typeof value == "undefined"){
    return JSON.parse(fs.readFileSync(schemesPath, 'utf8'))[key];
  }else if(key && typeof value != "undefined"){
    let tmp = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
    tmp[key] = value;
    fs.writeFileSync(schemesPath, JSON.stringify(tmp, null, 2));
    return true;
  }else{
    return JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
  }
};

module.exports = readWriteSchemes;