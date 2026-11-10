package com.mirroraction.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface FavoriteStockDao {

    /**
     * Emite la lista de favoritos cada vez que cambia en Room.
     */
    @Query("SELECT * FROM favorite_stocks ORDER BY addedAt DESC")
    fun getAllFavorites(): Flow<List<FavoriteStockEntity>>

    @Query("SELECT EXISTS(SELECT 1 FROM favorite_stocks WHERE symbol = :symbol)")
    fun isFavorite(symbol: String): Flow<Boolean>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFavorite(stock: FavoriteStockEntity)

    @Query("DELETE FROM favorite_stocks WHERE symbol = :symbol")
    suspend fun deleteFavoriteBySymbol(symbol: String)
}
