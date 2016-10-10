# Express Hero

<img src="logo.png" alt="express hero" align="right" />

A API REST prototype in Node.js using Express and MongoDB, performance and security best practices, only relying on npm for continuous integration and deployment on Heroku.

One-file configuration : *package.json* contains all the configuration needed for front, back, test, deployment phases. No bower, no Gulp/Grunt or other task runners, everything is done using npm.

## How does it work ?

  Typical workflow (continuous integration and deployment) : build assets live | check security -> test -> deploy and configure

### Front

  - Uses *[npm-industry]*(https://github.com/adrienvalcke/npm-industry) example to build assets with *npm*,
  - Uses *[Vanille]*(https://github.com/adrienvalcke/vanille) library for fast but simple API,
  - *Pug* template engine,
  - No framework integrated yet as *AngularJS*, *React*, ...

### Back

  - API REST structure with *method-override*,
  - *Express* lightweight framework for Node,
  - *[Denvar]*(https://github.com/adrienvalcke/denvar) to load environments variables - as database user and passwords for example - in development, test production environment locally and finally export them for production,
  - *[Crypte]*(https://github.com/adrienvalcke/crypte) to crypte user password or to generate a key in CLI with the very latest and best cryptographic recommendation.

### Performance

  - Uses gzip compression (*compression* middleware),
  - serves static files with *serve-static* middleware,
  - uses *debug* instead of *console* for logging,
  - uses *--trace-sync-io* command line flag to print a warning and a stack trace whenever the app uses a synchronous API,
  - exports/sets NODE_ENV to 'production' by *Denvar* to cache views + css files and print less verbose error messages.

### Security

  - Uses *helmet* to configure appropriate HTTP headers to prevent some attacks based on it,
  - uses cookies securely with *express-session* middleware and the *connect-mongodb-session* MongoDB session store in production,
  - uses *csurf* module to protect against cross-site request forgery (CSRF),
  - checks if dependencies are secure with *nsp*, run first in command line when deploying,
  - prevents from XSS and command injection attacks by using back-side Yahoo's XSS sanitization *[xss-filters]*(https://github.com/yahoo/xss-filters)
  - uses *safe-regex* to detect risks of regular expression denial of service attacks.

### Production case and other environments

  Express Hero makes difference between production phase and others (development, test, ...). In *package.json*, app can be run with `npm run start:dev` for development use or `npm run start:prod` to test production environment locally. To do so Express Hero sets a specific variable called *DENVAR* that is checked at the very first line of the app to load the environment needed. Doing this allows to not require *Denvar* in production and `npm start` launch a npm script designed to be only used in real production.

### Deploy

    - Add and commit your changes then deploy your app on the *Heroku* stage/test remote with one command : `npm run deploy:stage` and it will automatically :
      1. Check security,
      2. Test,
      3. Patch app version,
      4. Push on git,
      5. Push on *Heroku* stage remote,
      6. Open app in browser,
      7. Exports stage/test/production variables.

    - If everything is okay on stage, so deploy on the *Heroku* production remote (real app) : `npm run deploy:prod`

## Installation

You will need a [GitHub](https://github.com/) and [Heroku](https://www.heroku.com/) account plus [Git](https://git-scm.com/) and [heroku-toolbelt](https://toolbelt.heroku.com/) installed **if you want** to version/deploy your app. Please jump deployment steps and requirements if not needed.

  1. **Clone the repository** and rename it at your own project name `$ git clone https://github.com/adrienvalcke/express-hero.git`
  2. **Create a new repository** in your *Git* account called the name you want
  3. **Go to your new project name directory** within the terminal
  4. **Still in the terminal**
    - Run `$ git init && git add . && git commit -m "initial commit" && git remote add origin https://github.com/yourusername/your-project-name.git && git push -u origin master`
    - Run `$ heroku login` to log into your *Heroku* account.
    - Once logged in, run `$ heroku create your-project-name && heroku create stage-your-project-name` to create a production and a stage app (to check if all is okay before production).
    - Check your git remotes by running `$ git remote -v`. We want a production (pointing to https://git.heroku.com/your-project-name.git) and a stage remote (pointing to https://git.heroku.com/stage-your-project-name.git). So first rename "heroku" remote by running `$ git remote rename heroku production` and then add stage remote `$ git remote add stage https://git.heroku.com/stage-your-project-name.git`

    - Was not friendly but you're done !

    5. **Now run** `$ npm install` to install all your environment.

That's it !

## Use it !

  - **You want to develop your assets in realtime** :

    Run `$ npm run dev`.

    (See *[npm-industry]*(https://github.com/adrienvalcke/npm-industry) for more details).

  - **You want to deploy** :

    Add and commit changes then run `$ npm run deploy:stage`. Everything is okay on stage ? Yeeah ! So deploy on production with `$ npm run deploy:prod`.

## Contributing

This project is still in development and needs to be maintained to the last versions/best practices. I wish I could improve speed build and so live reload... Any advices or help will be greatly appreciated.

### Performance
  - Add a process manager for the app to automatically restart (PM2 or StrongLoop)
  - Run app in a cluster
  - Use a load balancer
  - Use a reverse proxy

### Security
  - Add a process manager for the app to automatically restart (PM2 or StrongLoop) and other features as monitoring app, ... Notice that Node apps on Heroku are automatically restarted in case of crash.
  - Use TLS (the next progression of SSL)
  - Prevent brute-force attacks against authentication by implementing rate-limiting
  - Use *[nmap]*(https://nmap.org/) and *[sslyze]*(https://github.com/nabla-c0d3/sslyze) tools to test SSL configuration

## Notes

This project was initially made to help me building Node/Express apps with a front-end workflow to kick it faster. This structure may not match your attempts or project needs. Please feel free to fork, adapt, add front or back tools (React, ...).

This work is a result of joining different sources on the internet. Here are they :

- [Express Performance best practices](http://expressjs.com/en/advanced/best-practice-performance.html)
- [Express Security best practices](http://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [NPM Scripts Example](https://github.com/keithamus/npm-scripts-example) from [Keith Cirkel](https://github.com/keithamus), largely inspired of. A big thank to you !
- [Using NPM as a Task Runner](http://paulcpederson.com/articles/npm-run/)
- [Testing and deploying with ordered npm run scripts](http://blog.npmjs.org/post/127671403050/testing-and-deploying-with-ordered-npm-run-scripts)
- [Why npm Scripts?](https://css-tricks.com/why-npm-scripts/)
- [NPM scripting : git, version and deploy](http://www.marcusoft.net/2015/08/npm-scripting-git-version-and-deploy.html)
- [Heroku Staging & Production Environments](http://www.mattboldt.com/heroku-staging-production-environments/)
- [Heroku: Managing multiple accounts and  environments](http://www.standardco.de/heroku-managing-multiple-accounts-and-environments)

My english seems confusing ? Feel free to correct my 'frenchy' sentences !

## Licence

The MIT License (MIT) Copyright © 2016 Adrien Valcke

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the “Software”), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
