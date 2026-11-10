package com.mirroraction.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.mirroraction.wear.ui.WearWatchlistScreen
import com.mirroraction.wear.ui.WearWatchlistViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class WearMainActivity : ComponentActivity() {

    private val viewModel: WearWatchlistViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        
        setContent {
            WearWatchlistScreen(
                viewModel = viewModel,
                onStockClick = { symbol ->
                    // Acción al seleccionar la acción en el reloj
                }
            )
        }
    }
}