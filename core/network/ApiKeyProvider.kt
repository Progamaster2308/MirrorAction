package com.mirroraction.core.network

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

public interface ApiKeyProvider {
    public fun getKey(): String
}

@Singleton
public class ApiKeyProviderImpl @Inject constructor() : ApiKeyProvider {
    override fun getKey(): String {
        // Tu API Key real de Alpha Vantage
        return "D0FXDCKYTVUWBBT7"
    }
}

@Module
@InstallIn(SingletonComponent::class)
public abstract class ApiKeyModule {

    @Binds
    @Singleton
    public abstract fun bindApiKeyProvider(
        impl: ApiKeyProviderImpl
    ): ApiKeyProvider
}