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
import javax.inject.Inject

@HiltViewModel
class WearWatchlistViewModel @Inject constructor(
    private val repository: StockRepository
) : ViewModel() {

    private val defaultWatchlist = listOf(
        StockQuote("NVDA", "NVIDIA Corp", 147.50, 4.25, 2.97, 143.80, 148.20, 143.10, 143.25, 68420000L),
        StockQuote("MSFT", "Microsoft Corp", 545.18, 14.60, 2.75, 535.20, 548.00, 534.50, 530.58, 24150000L),
        StockQuote("AAPL", "Apple Inc.", 227.40, -1.35, -0.59, 228.90, 229.40, 226.50, 228.75, 51200000L),
        StockQuote("TSLA", "Tesla Inc.", 328.60, 22.00, 7.17, 312.00, 332.50, 310.40, 306.60, 98500000L)
    )

    val favoriteQuotes: StateFlow<List<StockQuote>> = flow {
        // Emitir lista de favoritos base garantizada
        emit(defaultWatchlist)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = defaultWatchlist
    )
}