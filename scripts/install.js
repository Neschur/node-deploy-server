/**
 * Author: Andrey Gromozdov
 * Date: 04.12.13
 * Time: 0:09
 */

"use strict";

var path = require('path');
var fs = require('fs');
var platform = require('os').platform();
var Service, configTarget;

var templateName = 'nodehosting.json';
var configSource = path.join(__dirname, '../lib/templates', templateName) + '.template';

if (/win32/.test(platform)) {
    console.log('install windows service...');

    configTarget = path.join(__dirname, '../', templateName);
    Service = require('../lib/service/windows').Service;
}

if (/linux/.test(platform)) {
    console.log('install linux daemon...');

    configTarget = path.join('/etc', templateName);
    Service = require('../lib/service/systemv/index').Service;
}

if (!Service) {
    throw Error("Not supported platform: " + platform);
}

// Create a new service object
var svc = new Service({
    name: 'nodehosting',
    description: 'The node.js deploy service',
    script: './lib/server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
    console.log('service installed.');
});

var installConfigTemplate = function() {
    console.log('Target configuration: ' + configTarget);
    var exists = fs.existsSync(configTarget);
    if (exists) {
        console.log('Existing... skip');
        return;
    }

    console.log('Source configuration: ' + configSource);
    var data = fs.readFileSync(configSource);
    fs.writeFileSync(configTarget, data, {mode : '0666'});
    console.log('Configuration created');
};

installConfigTemplate();
svc.install();
