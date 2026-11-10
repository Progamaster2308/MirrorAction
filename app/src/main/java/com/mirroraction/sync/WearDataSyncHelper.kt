package com.mirroraction.sync

import android.content.Context
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WearDataSyncHelper @Inject constructor(
    @ApplicationContext private val context: Context
) {
    fun syncFavoritesToWatch(symbols: List<String>) {
        try {
            val request = PutDataMapRequest.create("/mirror_action/stocks").apply {
                dataMap.putStringArrayList("favorites", ArrayList(symbols))
                dataMap.putLong("timestamp", System.currentTimeMillis())
            }.asPutDataRequest().setUrgent()

            Wearable.getDataClient(context).putDataItem(request)
        } catch (_: Exception) {
            // Manejo silencioso si los emuladores no están emparejados por Bluetooth
        }
    }
}
