package com.mirroraction.core.model

/**
 * Representa una cotización en tiempo real en la capa de dominio.
 * Inmutable y desacoplada de cualquier librería de serialización.
 */
data class StockQuote(
    val symbol: String,
    val name: String,
    val price: Double,
    val change: Double,
    val changePercent: Double,
    val open: Double,
    val high: Double,
    val low: Double,
    val previousClose: Double,
    val volume: Long,
    val isFavorite: Boolean = false,
    val sparkline: List<Double> = emptyList(),
    val historicalPoints: List<PricePoint> = emptyList()
) {
    val isPositive: Boolean get() = change >= 0
    val formattedChange: String get() = if (isPositive) "+%.2f%%".format(changePercent) else "%.2f%%".format(changePercent)
}

data class PricePoint(
    val timestamp: String,
    val price: Double,
    val volume: Long = 0L
)

enum class TimeFrame(val label: String) {
    ONE_DAY("1D"),
    ONE_WEEK("1W"),
    ONE_MONTH("1M"),
    ONE_YEAR("1Y")
}

data class MarketIndex(
    val symbol: String,
    val name: String,
    val value: Double,
    val changePercent: Double
)
