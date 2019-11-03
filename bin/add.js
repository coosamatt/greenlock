'use strict';

var args = process.argv.slice(3);
var cli = require('./cli.js');
//var path = require('path');
//var pkgpath = path.join(__dirname, '..', 'package.json');
//var pkgpath = path.join(process.cwd(), 'package.json');

var Flags = require('./flags.js');

Flags.init().then(function({ flagOptions, rc, greenlock, mconf }) {
    var myFlags = {};
    [
        'subject',
        'altnames',
        'renew-offset',
        'server-key-type',
        'challenge',
        'challenge-xxxx',
        'challenge-json',
        'force-save'
    ].forEach(function(k) {
        myFlags[k] = flagOptions[k];
    });

    cli.parse(myFlags);
    cli.main(function(argList, flags) {
        main(argList, flags, rc, greenlock, mconf);
    }, args);
});

async function main(_, flags, rc, greenlock, mconf) {
    if (!flags.subject) {
        console.error(
            '--subject must be provided as the id of the site/certificate'
        );
        process.exit(1);
        return;
    }

    Flags.mangleFlags(flags, mconf);

    greenlock
        .add(flags)
        .catch(function(err) {
            console.error();
            console.error('error:', err.message);
            console.error();
        })
        .then(function() {
            return greenlock
                ._config({
                    servername:
                        flags.altnames[
                            Math.floor(Math.random() * flags.altnames.length)
                        ]
                })
                .then(function(site) {
                    if (!site) {
                        console.info();
                        console.info(
                            'Internal bug or configuration mismatch: No config found.'
                        );
                        console.info();
                        process.exit(1);
                        return;
                    }
                    console.info();
                    console.info('Created config!');
                    console.info();

                    Object.keys(site).forEach(function(k) {
                        if ('defaults' === k) {
                            console.info(k + ':');
                            Object.keys(site.defaults).forEach(function(key) {
                                var value = JSON.stringify(site.defaults[key]);
                                console.info('\t' + key + ':' + value);
                            });
                        } else {
                            console.info(k + ': ' + JSON.stringify(site[k]));
                        }
                    });
                    console.info();
                });
        });
}
