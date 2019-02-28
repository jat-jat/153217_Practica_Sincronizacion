import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import * as firebase from 'firebase';

const configFirebase = {
  apiKey: 'AIzaSyAwnEIeur1mDmkXBoZf3TAHYJ6y_voIaxk',
  authDomain: 'practicas-23f4e.firebaseapp.com',
  databaseURL: 'https://practicas-23f4e.firebaseio.com',
  projectId: 'practicas-23f4e',
  storageBucket: 'practicas-23f4e.appspot.com',
  messagingSenderId: '484021761197'
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // Al pulsar el botón de retorno de Android, salimos de la app.
      this.platform.backButton.subscribe(() => {
        navigator['app'].exitApp();
      });

      // Inicialización de Firebase.
      firebase.initializeApp(configFirebase);
    });
  }
}
