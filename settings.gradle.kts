pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MirrorAction"

// Módulos de la arquitectura limpia
include(":app")              // Módulo Smartphone (Jetpack Compose)
include(":wear")             // Módulo Smartwatch (Compose for Wear OS)
include(":core:model")       // Entidades de dominio compartidas
include(":core:network")     // Retrofit, Alpha Vantage API, DTOs
include(":core:database")    // Room Database, DAO y Entidades
include(":core:data")        // Repositorios y orquestación reactiva
