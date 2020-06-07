module.exports = (option = null, value) => {
    
 switch (option) {

        case 'markers':
            console.log(option, value);
            break;
        case 'edContainers':
            console.log(option, value);
            break;
        case 'development':
            // console.log(option, value);
            require('../lib/HTML')('saveAll', value);
            break;
 }

};