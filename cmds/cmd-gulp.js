
const chalk = require('chalk');
const { getRoot } = require('../lib/setRoot');
const path = getRoot();
const fs = require('fs');


const msg = 
`Starting gulp!
 Do not forget to stop it when finished work.
 Current working directory: ${path}
`;

module.exports = () => {

    console.log('path: ' + path);
    // require('../../../gulpStarter')(path);
    // const directory = fs.readdirSync('../../').forEach( (name) => {
    //     console.log(name);
    // })
    // require('../../gulpfile')(path);
    let validGulp = fs.existsSync('../../gulpfile.js');
    // let validDir = fs.existsSync('../../src/' + path);
    // let validFile = fs.existsSync('../../src/' + path + '/index.css.html');
    console.log('validGulp: ' + validGulp);   
    // console.log('validDir: ' + validDir);   
    // console.log('validFile: ' + validFile) ;  
}
