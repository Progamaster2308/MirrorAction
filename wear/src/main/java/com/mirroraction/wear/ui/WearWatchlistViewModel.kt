package com.mirroraction.wear.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mirroraction.core.data.StockRepository
import com.mirroraction.core.model.StockQuote
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.map
import javax.inject.Inject

@HiltViewModel
class WearWatchlistViewModel @Inject constructor(
    private val repository: StockRepository
) : ViewModel() {

    private val catalogMap = mapOf(
        "NVDA" to StockQuote("NVDA", "NVIDIA Corp", 147.50, 4.25, 2.97, 143.80, 148.20, 143.10, 143.25, 68420000L),
        "MSFT" to StockQuote("MSFT", "Microsoft Corp", 545.18, 14.60, 2.75, 535.20, 548.00, 534.50, 530.58, 24150000L),
        "AAPL" to StockQuote("AAPL", "Apple Inc.", 227.40, -1.35, -0.59, 228.90, 229.40, 226.50, 228.75, 51200000L),
        "TSLA" to StockQuote("TSLA", "Tesla Inc.", 328.60, 22.00, 7.17, 312.00, 332.50, 310.40, 306.60, 98500000L),
        "GOOGL" to StockQuote("GOOGL", "Alphabet Inc.", 181.20, 1.75, 0.98, 179.60, 182.10, 179.20, 179.45, 27800000L),
        "AMZN" to StockQuote("AMZN", "Amazon.com Inc.", 209.80, 5.60, 2.74, 205.10, 210.50, 204.80, 204.20, 42100000L)
    )

    private val defaultWatchlist = catalogMap.values.take(4)

    val favoriteQuotes: StateFlow<List<StockQuote>> = repository.getFavorites().map { entities ->
        if (entities.isEmpty()) {
            defaultWatchlist
        } else {
            entities.map { entity ->
                catalogMap[entity.symbol.uppercase()] ?: StockQuote(
                    symbol = entity.symbol,
                    name = entity.name,
                    price = if (entity.cachedPrice > 0.0) entity.cachedPrice else 150.0,
                    change = 1.2,
                    changePercent = entity.cachedChangePercent,
                    open = 150.0,
                    high = 152.0,
                    low = 148.0,
                    previousClose = 150.0,
                    volume = 1000000L,
                    isFavorite = true
                )
            }
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = defaultWatchlist
    )
}