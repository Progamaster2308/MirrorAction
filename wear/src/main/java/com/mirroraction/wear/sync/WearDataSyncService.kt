package com.mirroraction.wear.sync

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService
import com.mirroraction.core.database.FavoriteStockDao
import com.mirroraction.core.database.FavoriteStockEntity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class WearDataSyncService : WearableListenerService() {

    @Inject
    lateinit var dao: FavoriteStockDao

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        for (event in dataEvents) {
            if (event.type == DataEvent.TYPE_CHANGED) {
                val uri = event.dataItem.uri
                if (uri.path == "/mirror_action/stocks") {
                    val dataMap = DataMapItem.fromDataItem(event.dataItem).dataMap
                    val favorites = dataMap.getStringArrayList("favorites") ?: arrayListOf()
                    
                    scope.launch {
                        dao.clearAll()
                        val entities = favorites.map { symbol ->
                            FavoriteStockEntity(
                                symbol = symbol,
                                name = symbol,
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
    }
}
