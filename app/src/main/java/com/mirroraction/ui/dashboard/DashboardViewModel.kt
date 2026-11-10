package com.mirroraction.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mirroraction.core.data.StockRepository
import com.mirroraction.core.model.MarketIndex
import com.mirroraction.core.model.StockQuote
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val stocks: List<StockQuote> = emptyList(),
    val marketIndices: List<MarketIndex> = emptyList(),
    val searchQuery: String = "",
    val isLoading: Boolean = false,
    val selectedTab: DashboardTab = DashboardTab.ALL
)

enum class DashboardTab { ALL, WATCHLIST }

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: StockRepository
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    private val _selectedTab = MutableStateFlow(DashboardTab.ALL)
    
    // Tickers iniciales de monitoreo
    private val monitoredTickers = listOf("NVDA", "AAPL", "TSLA", "MSFT", "GOOGL", "AMZN")

    // Flujo combinado de cotizaciones en tiempo real y base de datos Room
    val uiState: StateFlow<DashboardUiState> = combine(
        repository.getMarketQuotesPoll(monitoredTickers),
        repository.getFavorites(),
        _searchQuery,
        _selectedTab
    ) { quotes, favorites, query, tab ->
        val favoriteSymbols = favorites.map { it.symbol }.toSet()
        val mappedQuotes = quotes.map { it.copy(isFavorite = favoriteSymbols.contains(it.symbol)) }
        
        val filtered = if (query.isNotBlank()) {
            mappedQuotes.filter { 
                it.symbol.contains(query, ignoreCase = true) || it.name.contains(query, ignoreCase = true) 
            }
        } else if (tab == DashboardTab.WATCHLIST) {
            mappedQuotes.filter { it.isFavorite }
        } else {
            mappedQuotes
        }

        DashboardUiState(
            stocks = filtered,
            marketIndices = listOf(
                MarketIndex("SPX", "S&P 500", 5864.67, 0.56),
                MarketIndex("IXIC", "NASDAQ", 18518.61, 0.78),
                MarketIndex("DJI", "Dow Jones", 42863.86, -0.11)
            ),
            searchQuery = query,
            selectedTab = tab,
            isLoading = false
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = DashboardUiState(isLoading = true)
    )

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
    }

    fun selectTab(tab: DashboardTab) {
        _selectedTab.value = tab
    }

    fun toggleFavorite(stock: StockQuote) {
        viewModelScope.launch {
            repository.toggleFavorite(stock)
        }
    }
}
