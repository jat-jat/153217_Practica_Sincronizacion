import { Component } from '@angular/core';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as firebase from 'firebase/app';
import { Network } from '@ionic-native/network/ngx';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // Controlador del formulario.
  formRegistro: FormGroup;

  // Nombre de la base de datos en la nube.
  readonly DB_FIREBASE = 'prac_sincronizacion';
  // Nombre del arreglo que almacena los elementos pendientes de ser subidos a la nube.
  readonly ELEM_PENDIENTES = 'pendientes';

  // Datos de los selects.
  readonly ocupaciones = [
    'Albañil', 'Ama de casa', 'Arquitecto', 'Artista', 'Biólogo', 'Deportista',
    'Docente', 'Doctor', 'Enfermero', 'Estudiante', 'Fontanero', 'Informático',
    'Jubilado', 'Mesero', 'Mecánico', 'Project Mananger', 'Promotor', 'Químico',
    'Secretario', 'Soldado', 'Vendedor', 'Otro'
  ];
  readonly ciudades = ['Acacoyagua', 'Acala', 'Acapetahua', 'Altamirano', 'Amatán', 
    'Amatenango de la Frontera', 'Amatenango del Valle', 'Angel Albino Corzo', 
    'Jaltenango de la Paz (Angel Albino Corzo)', 'Arriaga', 'Bejucal de Ocampo', 'Bella Vista', 
    'Berriozábal', 'Bochil', 'El Bosque', 'Cacahoatán', 'Catazajá', 'Cintalapa', 'Cintalapa de Figueroa', 
    'Coapilla', 'Comitán de Domínguez', 'La Concordia', 'Copainalá', 'Chalchihuitán', 'Chamula', 'Chanal', 
    'Chapultenango', 'Chenalhó', 'Chiapa de Corzo', 'Chiapilla', 'Chicoasén', 'Chicomuselo', 'Chilón', 
    'Escuintla', 'Francisco León', 'Rivera el Viejo Carmen', 'Frontera Comalapa', 'Frontera Hidalgo', 
    'La Grandeza', 'Huehuetán', 'Huixtán', 'Huitiupán', 'Huixtla', 'La Independencia', 'Ixhuatán', 
    'Ixtacomitán', 'Ixtapa', 'Ixtapangajoya', 'Jiquipilas', 'Jitotol', 'Juárez', 'Larráinzar', 'La Libertad', 
    'Mapastepec', 'Las Margaritas', 'Mazapa de Madero', 'Mazatán', 'Metapa', 'Metapa de Domínguez', 
    'Mitontic', 'Motozintla', 'Motozintla de Mendoza', 'Nicolás Ruíz', 'Ocosingo', 'Ocotepec', 
    'Ocozocoautla de Espinosa', 'Ostuacán', 'Osumacinta', 'Oxchuc', 'Palenque', 'Pantelhó', 'Pantepec', 
    'Pichucalco', 'Pijijiapan', 'El Porvenir', 'El Porvenir de Velasco Suárez', 'Villa Comaltitlán', 
    'Pueblo Nuevo Solistahuacán', 'Rayón', 'Reforma', 'Las Rosas', 'Sabanilla', 'Salto de Agua', 
    'San Cristóbal de las Casas', 'San Fernando', 'Siltepec', 'Simojovel', 'Simojovel de Allende', 
    'Sitalá', 'Socoltenango', 'Solosuchiapa', 'Soyaló', 'Suchiapa', 'Suchiate', 'Ciudad Hidalgo', 
    'Sunuapa', 'Tapachula', 'Tapachula de Córdova y Ordóñez', 'Tapalapa', 'Tapilula', 'Tecpatán', 
    'Tenejapa', 'Teopisca', 'Tila', 'Tonalá', 'Totolapa', 'La Trinitaria', 'Tumbalá', 'Tuxtla Gutiérrez', 
    'Tuxtla Chico', 'Tuzantán', 'Tzimol', 'Unión Juárez', 'Venustiano Carranza', 'Villa Corzo', 
    'Villaflores', 'Yajalón', 'San Lucas', 'Zinacantán', 'San Juan Cancuc', 'Aldama', 
    'Benemérito de las Américas', 'Maravilla Tenejapa', 'Marqués de Comillas', 'Zamora Pico de Oro', 
    'Montecristo de Guerrero', 'San Andrés Duraznal', 'Santiago el Pinar'
  ];

  constructor(private formBuilder: FormBuilder, private net: Network, private storage: Storage,
    private loadCtrl: LoadingController, private alertCtrl: AlertController, public toastCtrl: ToastController) {
      this.ciudades.sort();

      // Se inicializa el formulario.
      this.formRegistro = this.formBuilder.group({
        'nombre': ['', Validators.compose([Validators.required,
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ' -]{2,}$/), Validators.maxLength(100)])],
        'edad': ['', Validators.compose([Validators.required,
          Validators.pattern(/^[1-9]\d*$/), Validators.min(5), Validators.max(100)])],
        'sexo': [null, Validators.required],
        'ocupacion': [null, Validators.required],
        'ciudad': [null, Validators.required]
      });

      // Se inicializa el arreglo de elementos pendientes para subirse a la nube.
      this.storage.length().then((len) => {
        if (len == 0) {
          return this.storage.set(this.ELEM_PENDIENTES, []);
        }
      }).catch(e => {
        console.error(e);
      });

      // Cuando nos conectamos a internet se guardan los datos pendientes (sincronizamos).
      this.net.onConnect().subscribe(() => {
        setTimeout(() => {
          this.guardarPendientes();
        }, 3000);
      });
  }

  /**
   * Evento que se suscita cuando se muesta la página.
   */
  ionViewWillEnter() {
    if (this.net.type !== 'none' && this.net.type !== 'unknown'){
      // Si hay internet, sincronizamos.
      this.guardarPendientes();
    }
  }

  /**
   * Muestra una alerta básica (que únicamente muestra un mensaje) en la interfaz.
   */
  async mostrarAlertaSimple(header, subHeader, message) {
    const alert = await this.alertCtrl.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  /**
   * Muestra un toast (un rectángulo con un texto), en el centro de la pantalla, por un par de segundos.
   * @param texto El texto que contendrá el toast.
   */
  async mostrarToastSimple(texto: string) {
    const toast = await this.toastCtrl.create({
      message: texto,
      position: 'middle',
      duration: 2000
    });

    toast.present();
  }

  /**
   * Efectúa la sincronización; es decir, transfiere todos aquellos elementos, del
   * almacenamiento local, a la nube; porque el usuario no tenía internet cuando los guardó.
   */
  async guardarPendientes() {
    const msgCargando = await this.loadCtrl.create({
      message: 'Sincronizando...'
    });

    await msgCargando.present()
      // Se obtienen los elementos pendientes de ser subidos a la nube.
      .then(() => this.storage.get(this.ELEM_PENDIENTES))
      .then(async (pendientes) => {
        while ( pendientes.length !== 0) {
          // Se guarda un elemento pendiente a la nube.
          const insert = firebase.database().ref(this.DB_FIREBASE).push();
          await insert.set(pendientes[0]);
          // El elemento recién subido se elimina del almacenamiento local.
          pendientes.shift();
          await this.storage.set(this.ELEM_PENDIENTES, pendientes);
        }

        msgCargando.dismiss();
        this.mostrarToastSimple('Sincronización completada');
      }).catch(e => {
        msgCargando.dismiss();
        this.mostrarAlertaSimple('Error', e.message, 'No se pudo sincronizar.');
      });
  }

  /**
   * Se guarda la información del formulario, en la nube o en el dispositivo.
   */
  async guardarFormulario() {
    if (this.net.type === 'none' || this.net.type === 'unknown'){
      // No hay internet: La información se guarda en el dispositivo.
      const msgCargando = await this.loadCtrl.create({
        message: 'Guardando localmente...'
      });

      msgCargando.present()
      .then(() => this.storage.get(this.ELEM_PENDIENTES))
      .then((pendientes) => {
        pendientes.push(this.formRegistro.value);
        return this.storage.set(this.ELEM_PENDIENTES, pendientes);
      }).then(() => {
        this.formRegistro.reset();
        msgCargando.dismiss();
        this.mostrarToastSimple('Guardado (pendiente para sincronización)');
      }).catch(e => {
        msgCargando.dismiss();
        this.mostrarAlertaSimple('Error', e.message, 'No se pudo guardar localmente.');
      });
    } else {
      // Hay internet: La información se guarda en la nube.
      const msgCargando = await this.loadCtrl.create({
        message: 'Guardando en la nube...'
      });

      const insert = firebase.database().ref(this.DB_FIREBASE).push();
      msgCargando.present()
        .then(() => insert.set(this.formRegistro.value))
        .then(() => {
          this.formRegistro.reset();
          msgCargando.dismiss();
          this.mostrarToastSimple('Guardado');
        }).catch(e => {
          msgCargando.dismiss();
          this.mostrarAlertaSimple('Error', e.message, 'No se pudo guardar en la nube.');
        });
    }
  }
}