# MirrorAction — Multiplatform Stock Tracker for Android & Wear OS

Aplicación de visor de mercado en tiempo real diseñada para Smartphone (Android) y Smartwatch (Wear OS).
Desarrollada con **Kotlin 2.0**, **Jetpack Compose**, **Compose for Wear OS**, **Room Database**, **Retrofit** y **Coroutines Flow**.

## Requisitos Previos
1. **Android Studio**: Versión Ladybug (2024.2+) o superior recomendada.
2. **JDK**: Java 17 o Java 21 configurado en Gradle JDK.
3. **Android SDK**: API 35 (Android 15) instalada en el SDK Manager.

## Cómo Abrir y Ejecutar el Proyecto en tu Laptop
1. Descomprime este archivo ZIP en tu disco duro (ejemplo: `~/AndroidStudioProjects/MirrorAction` o `C:\Proyectos\MirrorAction`).
2. Abre Android Studio.
3. En la pantalla de bienvenida, haz clic en **Open** (o ve a **File > Open...** si ya tienes un proyecto abierto).
4. Selecciona la carpeta `MirrorAction` y haz clic en **OK**.
5. Espera a que Gradle descargue las dependencias y complete el **Gradle Sync** (esto tomará 1-2 minutos en la primera ejecución).
6. Para ejecutar la app de teléfono:
   - En el selector de configuraciones de ejecución (barra superior), selecciona el módulo `:app`.
   - Elige tu emulador Android (ej. Pixel 8 con API 34 o 35) o conecta tu teléfono físico con Depuración USB habilitada.
   - Pulsa el botón verde **Run (▶)**.
7. Para ejecutar la app de reloj inteligente:
   - En el selector de configuraciones, selecciona el módulo `:wear`.
   - Elige un emulador Wear OS (ej. Pixel Watch o Wear OS Round API 33/34).
   - Pulsa el botón verde **Run (▶)**.

## Configuración de Alpha Vantage API
Abre `core/data/.../StockRepository.kt` o ingresa tu clave API en `local.properties`:
```properties
ALPHAVANTAGE_API_KEY="TU_API_KEY_AQUI"
```
Puedes obtener una clave gratuita en: https://www.alphavantage.co/support/#api-key
