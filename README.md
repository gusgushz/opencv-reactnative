**COMO USAR setup_env.py**

# ARCHIVOS NECESARIOS PARA QUE FUNCIONE CORRECTAMENTE EL ARCHIVO

- Es necesario agregar a la carpeta src/config en /app y en /config sus respectivos .JSON con la informacion básica del proveedor, nombrando cada archivo con el nombre del proveedor.
- Tener los iconos (android e ios) en sus respectivas carpeta en assets/deviceIcons. Para ios es /AppIcon.appiconset y dentro se agrega la carpeta con el nombre del proveedor y dentro las imagenes. Para android es /mipmaps y dentro se agrega la carpeta con el nombre del proveedor.
  *https://www.appicon.co/* Esta es la url que se utiliza para crear los íconos, en android solo crea los ic_launcher.png, manualmente usando pptx creo la ic_launcher_round.png
- También es requisito tener el logo o imagen logo que se va a usar en la splashscreen (mediante bootsplash) dentro de assets/logos con el formato logo-{provider}.png
- En caso de que el logo sea diferente a la imagen usada dentro de la app (en la pantalla home/login/downloadsecretkey) se debe agregar manualmente esta imagen dentro de la carpeta assets/images con el nombre logoHome-{provider}.png y luego dentro de src/globalVariables.ts agregar el path para la imagen (seguir formato)
- Por último, se debe agregar dentro de globalVariables.ts el sufix relacionado con el proveedor (no necesariamente tiene que llevar algo en el nombre relacionado con él). Y luego dentro del setup_env.py buscar por la linea 425 para agregar a la lista de proveedores y se pueda hacer el cambio de sufix entre proveedores.
- OPCIONAL. Si el cliente quiero un nombre en particular o agregar algo extra al nombre AppName (dentro del config/app.json) como en chiapas que se agrega publico o privado por la linea 75 de setup_env.py se puede agregar la excepción.
* RECORDAR. Al cambiar la version (major, minor o patch), se tiene que cambiar de manera manual antes de hacer una version relesase. Para esto "npm version (versionado)" y luego entrar a app/build.gradle y cambiar la version de android (IOS pendiente saber donde). No se agrega al archivo setup_env, por lo que siempre es manual esto.

# VER PASO SIGUIENTE ANTES DE USAR. Comandos para utilizar el cambio de ambiente entre windows y mac, limpiar antes de utilizar el script

python .\setup_env.py demo public // WINDOWS
python3 ./setup_env.py demo private // MACOS

### LIMPIAR BUILD ANDROID

cd Android
./gradlew --stop
./gradlew clean
./gradlew assembleRelease //Para crear release

### LIMPIAR BUILD IOS

cd ios
xcodebuild clean (cmd+shift+k en xcode)
//Para crear release se tiene que cambiar el schema (via codigo o en xcode->product/schema/edit) y RUN

### LIMPIAR METRO

npx react-native start --reset-cache
//En algunos casos puede ser necesario borrar las carpetas build dentro de /android y /android/app

//Para poder hacer un debug solo para una arquitectura (la del dispositivo objetivo aka mi telefono)
npx react-native run-android --active-arch-only

http://ec2-3-16-117-69.us-east-2.compute.amazonaws.com/key/

**Opencv-JS**

Proyecto para hacer pruebas en la instalación y funcionamiento de opencv

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
