const { getRoot } = require('../lib/setRoot');
const path = getRoot();

const msg = 
`Starting observers!
 Do not forget to stop them when finished work.
 Current working directory: ${path}
`;

module.exports = () => {
    require('../lib/observer');
    console.log("Starting observers!");
    console.log('Current root directory: ' + path);
}
    