package com.mirroraction.core.network.model

import com.google.gson.annotations.SerializedName

/**
 * Estructura de respuesta para el endpoint GLOBAL_QUOTE de Alpha Vantage.
 */
data class AlphaVantageGlobalQuoteResponse(
    @SerializedName("Global Quote")
    val globalQuote: GlobalQuoteDto?,
    @SerializedName("Note")
    val rateLimitNote: String? = null,
    @SerializedName("Information")
    val informationNote: String? = null
)

data class GlobalQuoteDto(
    @SerializedName("01. symbol")
    val symbol: String,
    @SerializedName("02. open")
    val open: String,
    @SerializedName("03. high")
    val high: String,
    @SerializedName("04. low")
    val low: String,
    @SerializedName("05. price")
    val price: String,
    @SerializedName("06. volume")
    val volume: String,
    @SerializedName("07. latest trading day")
    val latestTradingDay: String,
    @SerializedName("08. previous close")
    val previousClose: String,
    @SerializedName("09. change")
    val change: String,
    @SerializedName("10. change percent")
    val changePercent: String
)

/**
 * Estructura de respuesta para SYMBOL_SEARCH.
 */
data class AlphaVantageSearchResponse(
    @SerializedName("bestMatches")
    val bestMatches: List<SymbolMatchDto>?
)

data class SymbolMatchDto(
    @SerializedName("1. symbol")
    val symbol: String,
    @SerializedName("2. name")
    val name: String,
    @SerializedName("3. type")
    val type: String,
    @SerializedName("4. region")
    val region: String,
    @SerializedName("8. currency")
    val currency: String
)

/**
 * Estructura para series históricas (TIME_SERIES_INTRADAY).
 */
data class AlphaVantageTimeSeriesResponse(
    @SerializedName("Time Series (5min)")
    val timeSeries: Map<String, TimeSeriesPointDto>?
)

data class TimeSeriesPointDto(
    @SerializedName("1. open")
    val open: String,
    @SerializedName("2. high")
    val high: String,
    @SerializedName("3. low")
    val low: String,
    @SerializedName("4. close")
    val close: String,
    @SerializedName("5. volume")
    val volume: String
)
