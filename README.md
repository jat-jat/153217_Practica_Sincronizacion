# Práctica de sincronización de datos con Ionic

![Captura de pantalla](https://user-images.githubusercontent.com/32760027/53609854-6f499980-3b8e-11e9-9241-329447e531d3.jpg)

Consiste en un módulo de registro para ciudadanos. Con los siguientes datos:
* Nombre
* Edad
* Sexo
* Ocupación
* Ciudad (dentro del estado de Chiapas)

Cuando el usuario registra uno:
* Si hay internet, se guarda en una base de datos en la nube.
* Si no hay internet, se guarda localmente. La próxima vez que el dispositivo del usuario se conecte, éste se guardará en la nube; es decir, los datos se sincronizarán.

Complementos usados:

 Nombre  | Uso | Ubicación en el código 
 ------------- | ------------- | ------------- 
 Firebase | Base de datos en la nube. | \src\app\app.module.ts (llaves) y \src\app\home\home.page.ts 
 Storage y cordova-sqlite-storage | Guardar la información de los ciudadanos que está pendiente de ser subida en la nube. | \src\app\home\home.page.ts 
 Network | ⬤ Detectar si hay conexión a internet al iniciar la app, si es así, se sincroniza. <br/> ⬤ Detectar si hay conexión a internet, para decidir dónde guardar la información del ciudadano que se esté registrando actualmente. <br/> ⬤ Detectar el momento en el que el usuario se conecta a internet, mientras la app esté abierta, para desencadenar el proceso de sincronización. | \src\app\home\home.page.ts 

Información del autor:
```
UNIVERSIDAD POLITÉCNICA DE CHIAPAS
INGENIERÍA EN DESARROLLO DE SOFTWARE
Desarrollo de aplicaciones móviles – Corte 2

Javier Alberto Argüello Tello – 153217 – 8º
28 de febrero del 2019
```
