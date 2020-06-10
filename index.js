const inq = require('inquirer');
inq.registerPrompt('directory', require('inquirer-directory'));

const chalk = require('chalk');
const boxen = require('boxen');
const { getRoot, setRoot } = require('./lib/setRoot');

const wannaSetRootPrompt = 
    {
            name: 'setRoot',
            type: 'confirm',
            message : (answers) => {
                return boxen( 
                    chalk.bold('Munka mappa: ' + getRoot()) +
                    chalk.bold('\nMeg akarod változtatni a jelenlegi munka mappát?'),
                {borderStyle: 'double', padding: 1, float:  'left', margin: 1, backgroundColor: 'gray'} )
            },
    };

const setRootPrompt =
{
    type : 'directory',
    name : "path",
    message : chalk.yellowBright.bgCyanBright(" Jelöld ki a gyökérmappát! "),
    onlyShowDir : true,
    basePath : './src'      
};

const menuPrompt = 
{
    name : "menu",
    type : "list",
    message: chalk.bold.bgGreen.yellowBright(" Válassz az alábbiak közül! "),
    choices: [
                {name : 'gulp indítása', value : 'gulp'},
                {name : 'figyelők indítása', value: 'observers'},
                {name : 'eszköz választás', value : 'tools'}
             ]
};

const chooseTool = () => {

    inq.prompt(
        [
            {
                name : 'muvelet',
                type : 'list',
                choices : [
                    new inq.Separator(),                   
                    { name: 'markerek mutatása / elrejtése', value :"markers"},
                    { name: 'ed-container jelölők aktualizálása a style.scss fájlban', value :"edContainers"},
                    { name: 'a fejlesztés lezárása / folytatása', value :"development"},                   
                    new inq.Separator()
                ]
            },
            {
                name : 'markers',
                type : 'list',
                message : chalk.bold.bgWhite.blue('-- Az elem csoport azonosítók mutatása - elrejtése? --'),
                choices : [ { name : 'show', value: 'show' }, { name: 'hide', value: 'hide' }],
                when : answers => answers.muvelet == 'markers'               
            },
            {
                name : 'edContainers',
                type : 'confirm',
                message : chalk.bold.bgWhite.blue('-- Aktualizáljam a style.scss file-ban az ed-container sorokat? --'),
                when : answers => answers.muvelet == 'edContainers'    
            },
            {
                name : 'development',
                type : 'list',
                message : chalk.bold.bgWhite.blue('-- Fejlesztés: folytatása - befejezése? --'),
                choices : [ 'continue', 'finish'],
                when : answers => answers.muvelet == 'development'                
            }
        ]
        ).then( (ans) => {

            const { markers  = null, edContainers = null, development = null } = ans;
            
            switch(true){

                case markers != null:
                    require('./cmds/cmd-tools')('markers', ans.markers);
                break;

                case edContainers != null:
                    require('./cmds/cmd-tools')('edContainers', ans.edContainers);
                break;

                case development != null:
                    require('./cmds/cmd-tools')('development', ans.development);                   
                break;
            }
        })
};

const main = () => {
    inq.prompt(wannaSetRootPrompt)
        .then( async (answers) => {
            
            if(answers.setRoot === true){ 

            await inq.prompt(setRootPrompt)
                    .then( (answers) => {
                        // console.log("ANSWERS.path " + answers.path);
                        setRoot(answers.path.replace(/\\/g, '/'));
                    })
            }

            inq.prompt(menuPrompt)
                .then( (answers) => {

                    switch (answers.menu){

                        case 'gulp':
                            require('./cmds/cmd-gulp')();
                            break;
                        case 'observers':
                            require('./cmds/cmd-observers')();
                            break;
                        case 'tools':
                            chooseTool();
                            break;
                    }
                });

        })
};

module.exports = main;