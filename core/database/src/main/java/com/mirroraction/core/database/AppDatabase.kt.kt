package com.mirroraction.core.database

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [FavoriteStockEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun favoriteStockDao(): FavoriteStockDao
}