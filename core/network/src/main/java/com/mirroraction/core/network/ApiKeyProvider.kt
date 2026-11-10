package com.mirroraction.core.network

import javax.inject.Inject
import javax.inject.Singleton

interface ApiKeyProvider {
    fun getKey(): String
}

@Singleton
class ApiKeyProviderImpl @Inject constructor() : ApiKeyProvider {
    override fun getKey(): String {
        return "demo"
    }
}