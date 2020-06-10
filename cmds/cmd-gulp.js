
const chalk = require('chalk');
const { getRoot } = require('../lib/setRoot');
const path = getRoot();


module.exports = () => {
    const working_dir = process.cwd();
    require(working_dir + '/gulpfile')(path); 
}
