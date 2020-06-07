const Configstore = require('configstore');
const conf = new Configstore('rootDirectory');

module.exports = 
{

    getRoot() {
        return conf.get('root');
    },
    setRoot(path = null){
        conf.set('root', path);
        return;
    }
}