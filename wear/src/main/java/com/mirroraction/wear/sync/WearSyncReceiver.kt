package com.mirroraction.wear.sync

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.mirroraction.core.database.FavoriteStockDao
import com.mirroraction.core.database.FavoriteStockEntity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class WearSyncReceiver : BroadcastReceiver() {

    @Inject
    lateinit var dao: FavoriteStockDao

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == "com.mirroraction.SYNC_FAVORITES") {
            val symbolsString = intent.getStringExtra("symbols") ?: ""
            val symbols = symbolsString.split(",").map { it.trim() }.filter { it.isNotEmpty() }
            
            scope.launch {
                dao.clearAll()
                val entities = symbols.map { symbol ->
                    FavoriteStockEntity(
                        symbol = symbol.uppercase(),
                        name = symbol.uppercase(),
                        cachedPrice = 0.0,
                        cachedChangePercent = 0.0
                    )
                }
                if (entities.isNotEmpty()) {
                    dao.insertAll(entities)
                }
            }
        }
    }
}
