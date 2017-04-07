# Everything Web Project 2: Lifely - Part-Up App Optimizations
This readme contains documentation on the optimizations and add-ons that I worked on for Project 2.

## The assignment
Analyse the application and use your knowledge gained in the past 3 weeks to find bugs, semantic errors, unoptimized assets etc. and improve the application with any enhancement you'd like, provided it truly enhances the application.

### Project outline
* Checkout a repository
* Get the development environment running
* Get completely overwhelmed
* Not give up, push through
* Pick or create a story
* Develop
* Push a pullrequest
* Pat yourself on the back 👊

### Part-up tech stack
* Back-end: MeteorJS
* Build tool: MeteorJS
* Front-end: MeteorJS
* Development: MeteorJS
* Deployment: Ansible / Docker / Jenkins

## What I worked on
At first I set out to optimize the application by compressing all assets, including CSS/JS, create critical CSS and async loading of scripts and assets.

It turned out that many of my co-students worked on this same issue, therefore I decided to work on Service Workers, some UX improvements and branding (native app banners).

### Service Worker
The service worker has been implemented succesfully. It took some time because the basic SW installation caused all the files in the root to be cached. Since additional folders are generated at compile time to the client folder, the SW caused the app to stop functioning as it couldn't connect to the server. This was solved by implementing a piece of code from https://github.com/NitroBAY/meteor-service-worker that makes sure certain folders are excluded.

![SW installed](https://raw.github.com/SadisticSun/part-up/develop/app/readme-img/sw_installed.png?raw=true)

![SW running](https://raw.github.com/SadisticSun/part-up/develop/app/readme-img/sw_running.png?raw=true)

![SW caching](https://raw.github.com/SadisticSun/part-up/develop/app/readme-img/sw_fetch.png?raw=true)

### Progressive Web App

As a result of the succesful implementation of the service worker, the app can now be used as a PWA on Android devices.

![PWA](https://raw.github.com/SadisticSun/part-up/develop/app/readme-img/lg_pwa_splash.png?raw=true)

![PWA](https://raw.github.com/SadisticSun/part-up/develop/app/readme-img/lg_pwa.png?raw=true)

