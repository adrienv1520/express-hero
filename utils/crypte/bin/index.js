#! /usr/bin/env node

// sudo npm link

var crypte = require('../lib');
var conf = require('../lib/conf');

var help = 'crypte --genkey|-gk password saltPassword [keylen(256(default))] [digest(sha256|sha384|sha512)] [iterations(100000 (default)|min 10)] [encoding(binary(default)|base64|hex)] \n\neg. :\ncrypte --genkey asecretpass saltpass 32\ncrypte -gk anothersecretpass anothersaltpass\ncrypte -gk mysuperpass mysupersaltpass 32 sha256 100000 hex';

var userArgs = process.argv.slice(2);

if (!userArgs[0]) {
  console.info(help);
} else {
  switch (userArgs[0]) {
    case '--genkey':
    case '-gk':
      var password = '',
          saltPassword = '',
          iterations = conf.defaults.iterations,
          keylen = conf.defaults.keylen,
          digest = conf.defaults.digest,
          encoding = conf.defaults.encoding;


      if (userArgs[1]) password = userArgs[1];
      if (userArgs[2]) saltPassword = userArgs[2];
      if (userArgs[3]) keylen = userArgs[3];
      if (userArgs[4]) digest = userArgs[4];
      if (userArgs[5]) iterations = userArgs[5];
      if (userArgs[6]) encoding = userArgs[6];

      var key = crypte.genKeySync({password: password,
                                   iterations: iterations,
                                   keylen: keylen,
                                   digest: digest,
                                   encoding: encoding,
                                   saltPassword: saltPassword});

      console.info('Generated key : \nencoding : ' + encoding + '\nbits : ' + key.length + '\nkey : ' + key);
      break;
    case '--help':
    case '-h':
      console.info(help);
      break;
    default:
      console.info(help);
  }
}
