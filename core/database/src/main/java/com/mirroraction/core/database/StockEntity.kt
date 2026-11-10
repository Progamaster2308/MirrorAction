package com.mirroraction.core.database

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Tabla local de SQLite gestionada por Room para la lista de favoritos.
 */
@Entity(tableName = "favorite_stocks")
data class FavoriteStockEntity(
    @PrimaryKey
    val symbol: String,
    val name: String,
    val addedAt: Long = System.currentTimeMillis(),
    val cachedPrice: Double = 0.0,
    val cachedChangePercent: Double = 0.0
)
