module.exports = (option = null, value) => {
    
 switch (option) {

        case 'markers':
            // console.log(option, value);
            const settings = require('../lib/readWriteSettings');

            if(value === 'show'){

                const inq = require('inquirer');
                const chalk = require('chalk');
                const marker_schemes = require('../lib/readMarkerSchemes')();
    
                inq.prompt( 
                    [
                        {
                            name: 'scheme',
                            type : 'rawlist',
                            message : 'Válaszd ki az egyiket!',
                            choices :   () => {
                                    return Object.keys(marker_schemes);
                            }  
                        }
                    ]
                )
                .then( (answers) => {
                    const key = answers.scheme;
                    settings('markers', true);
                    settings('markerScheme', marker_schemes[key]);
                    require('../lib/HTML')('show', marker_schemes[key]);
                });

            }else{
                settings('markers', false);
                require('../lib/HTML')('hide');
            }
            break;
        case 'edContainers':
            console.log(option, value);
            require('../lib/HTML')('maintenance', value);
            break;
        case 'development':
            require('../lib/HTML')('saveAll', value);
            break;
 }

};