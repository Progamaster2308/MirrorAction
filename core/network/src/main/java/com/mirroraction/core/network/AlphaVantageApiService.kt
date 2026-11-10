package com.mirroraction.core.network

import com.mirroraction.core.network.model.AlphaVantageGlobalQuoteResponse
import com.mirroraction.core.network.model.AlphaVantageSearchResponse
import com.mirroraction.core.network.model.AlphaVantageTimeSeriesResponse
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * Contrato Retrofit para interactuar con la API oficial de Alpha Vantage.
 */
interface AlphaVantageApiService {

    /**
     * Obtiene la cotización global en tiempo real de un activo financiero.
     * Ejemplo: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=NVDA&apikey=YOUR_KEY
     */
    @GET("query?function=GLOBAL_QUOTE")
    suspend fun getGlobalQuote(
        @Query("symbol") symbol: String,
        @Query("apikey") apiKey: String
    ): AlphaVantageGlobalQuoteResponse

    /**
     * Búsqueda dinámica de símbolos / tickers en la base de datos de Alpha Vantage.
     * Ejemplo: https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=apple&apikey=YOUR_KEY
     */
    @GET("query?function=SYMBOL_SEARCH")
    suspend fun searchSymbol(
        @Query("keywords") keywords: String,
        @Query("apikey") apiKey: String
    ): AlphaVantageSearchResponse

    /**
     * Serie temporal intradía (intervalo de 5 min) para gráficos interactivos.
     */
    @GET("query?function=TIME_SERIES_INTRADAY&interval=5min")
    suspend fun getIntradaySeries(
        @Query("symbol") symbol: String,
        @Query("apikey") apiKey: String
    ): AlphaVantageTimeSeriesResponse
}
