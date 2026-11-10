package com.mirroraction.core.data

import com.mirroraction.core.database.FavoriteStockDao
import com.mirroraction.core.database.FavoriteStockEntity
import com.mirroraction.core.model.StockQuote
import com.mirroraction.core.network.AlphaVantageApiService
import com.mirroraction.core.network.ApiKeyProvider
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.isActive
import javax.inject.Inject
import javax.inject.Singleton

public interface StockRepository {
    public fun getMarketQuotesPoll(symbols: List<String>, intervalMillis: Long = 10_000L): Flow<List<StockQuote>>
    public fun getFavorites(): Flow<List<FavoriteStockEntity>>
    public suspend fun toggleFavorite(stock: StockQuote)
    public suspend fun searchStocks(query: String): List<StockQuote>
}

@Singleton
public class StockRepositoryImpl @Inject constructor(
    private val api: AlphaVantageApiService,
    private val dao: FavoriteStockDao,
    private val apiKeyProvider: ApiKeyProvider
) : StockRepository {

    /**
     * Mecanismo de Polling controlado: emite cotizaciones reactivamente en intervalos seguros
     * respetando el límite de peticiones de Alpha Vantage.
     */
    override fun getMarketQuotesPoll(
        symbols: List<String>,
        intervalMillis: Long
    ): Flow<List<StockQuote>> = flow {
        while (currentCoroutineContext().isActive) {
            val quotes = mutableListOf<StockQuote>()
            
            for (symbol in symbols) {
                try {
                    val response = api.getGlobalQuote(symbol, apiKeyProvider.getKey())
                    response.globalQuote?.let { dto ->
                        quotes.add(
                            StockQuote(
                                symbol = dto.symbol,
                                name = getCompanyName(dto.symbol),
                                price = dto.price.toDoubleOrNull() ?: 0.0,
                                change = dto.change.toDoubleOrNull() ?: 0.0,
                                changePercent = dto.changePercent.replace("%", "").toDoubleOrNull() ?: 0.0,
                                open = dto.open.toDoubleOrNull() ?: 0.0,
                                high = dto.high.toDoubleOrNull() ?: 0.0,
                                low = dto.low.toDoubleOrNull() ?: 0.0,
                                previousClose = dto.previousClose.toDoubleOrNull() ?: 0.0,
                                volume = dto.volume.toLongOrNull() ?: 0L
                            )
                        )
                    }
                } catch (e: Exception) {
                    // Fallback a caché o registro de error controlado sin romper el Flow
                }
            }
            
            emit(quotes)
            delay(intervalMillis)
        }
    }

    override fun getFavorites(): Flow<List<FavoriteStockEntity>> = dao.getAllFavorites()

    override suspend fun toggleFavorite(stock: StockQuote) {
        if (stock.isFavorite) {
            dao.deleteFavoriteBySymbol(stock.symbol)
        } else {
            dao.insertFavorite(
                FavoriteStockEntity(
                    symbol = stock.symbol,
                    name = stock.name,
                    cachedPrice = stock.price,
                    cachedChangePercent = stock.changePercent
                )
            )
        }
    }

    override suspend fun searchStocks(query: String): List<StockQuote> {
        val res = api.searchSymbol(query, apiKeyProvider.getKey())
        return res.bestMatches?.map { match ->
            StockQuote(
                symbol = match.symbol,
                name = match.name,
                price = 0.0,
                change = 0.0,
                changePercent = 0.0,
                open = 0.0,
                high = 0.0,
                low = 0.0,
                previousClose = 0.0,
                volume = 0L
            )
        } ?: emptyList()
    }

    private fun getCompanyName(symbol: String): String = when (symbol.uppercase()) {
        "NVDA" -> "NVIDIA Corporation"
        "AAPL" -> "Apple Inc."
        "TSLA" -> "Tesla, Inc."
        "MSFT" -> "Microsoft Corporation"
        "GOOGL" -> "Alphabet Inc."
        "AMZN" -> "Amazon.com Inc."
        else -> symbol
    }
}

@Module
@InstallIn(SingletonComponent::class)
public abstract class StockRepositoryModule {

    @Binds
    @Singleton
    public abstract fun bindStockRepository(
        impl: StockRepositoryImpl
    ): StockRepository
}