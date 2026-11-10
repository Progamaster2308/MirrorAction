plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.mirroraction.core.data"
    compileSdk = 35

    defaultConfig {
        minSdk = 26
        consumerProguardFiles("consumer-rules.pro")
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Exponemos el módulo de red y su NetworkModule hacia la app principal
    api(project(":core:network"))
    implementation(project(":core:database"))
    implementation(project(":core:model"))

    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
}