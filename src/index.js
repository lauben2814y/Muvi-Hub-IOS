import Framework7 from './js/framework7-custom';
import { routes } from './js/routes';
import ui from './js/main.ui';

const app = new Framework7({
  name: 'Muvi Hub',
  theme: 'ios',
  init: false,
  colors: {
    primary: '#800080'
  },
  routes: routes,
  el: '#app',
});
app.ui = ui;

// custom styles
import './css/framework7-custom.less';
import './css/icons.css';
import './css/app.css';
import './css/slider.css';
import './css/pages.css';
import './css/responsive.css';

// Main entry for app
document.addEventListener('DOMContentLoaded', async () => {
  app.ui.accessNativeFunctionality();
  app.init();
});

// Admob ads dismissal
document.addEventListener('admob.ad.dismiss', async (e) => {
  if (e.adId == process.env.INTERSTITIAL_AD_ID) {
    console.log("Interstitial closed");
    app.ui.loadInterstitial();
  } else if (e.adId == process.env.REWARDED_AD_ID) {
    console.log("Rewarded closed");
    app.ui.loadRewarded();
  } else if (e.adId == process.env.REWARDED_INTERSTITIAL_AD_ID) {
    console.log("Rewarded Interstitial closed");
    app.ui.loadRewardedInterstitial();
  }
});

// App instance listeners
app.on('click', async (event) => {
  app.ui.clickHandler(event);
});

app.on('connection', (isOnline) => {
  if (isOnline) {
    console.log('app is online now')
  } else {
    console.log('app is offline now')
  }
});