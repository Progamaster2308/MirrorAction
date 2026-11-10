package com.mirroraction.core.network

import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class NetworkModule {

    @Binds
    @Singleton
    abstract fun bindApiKeyProvider(
        impl: ApiKeyProviderImpl
    ): ApiKeyProvider

    companion object {
        @Provides
        @Singleton
        fun provideRetrofit(): Retrofit {
            return Retrofit.Builder()
                .baseUrl("https://www.alphavantage.co/")
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }

        @Provides
        @Singleton
        fun provideAlphaVantageApiService(retrofit: Retrofit): AlphaVantageApiService {
            return retrofit.create(AlphaVantageApiService::class.java)
        }
    }
}