# Muvi Hub IOS

## Install necessary Dependencies

First of all we need to install all the necessary dependencies, run in terminal

```
npm install
```

## NPM Scripts

- 🔥 `npm start` - run development server
- 🔧 `npm run build` - build web app for production outputs in the `www/`

## Platform IOS

Next we need to install the latest IOS cordova platform version

```
cordova platform add ios@7.1.1
```

## Cordova plugins

By default all the plugins should be installed by running `npm install` but if they aren't. We should install them manually by copying the GITHUB URLS included in package.json and running

```
cordova plugin add <github-plugin-repo-url>
```

Please note the IOS version support and usage for the plugin as it defers from android

## Documentation & Resources

Muvi-Hub uses the `Framework 7` UI libary for reference

- [Framework7 Core Documentation](https://framework7.io/docs/)

- [Framework7 Icons Reference](https://framework7.io/icons/)
- [Community Forum](https://forum.framework7.io)
