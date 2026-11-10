package com.mirroraction.wear.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mirroraction.core.model.StockQuote
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class WearWatchlistViewModel @Inject constructor() : ViewModel() {

    val favoriteQuotes: StateFlow<List<StockQuote>> = flow<List<StockQuote>> {
        emit(emptyList())
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )
}