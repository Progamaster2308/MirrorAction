package com.mirroraction

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.mirroraction.ui.dashboard.DashboardScreen
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    // Si tu DashboardScreen utiliza Hilt para proveer el ViewModel internamente,
                    // o si necesita que se lo pases, ajústalo según su firma.
                    // Si usa viewModel() por defecto o HiltViewModel, pasamos los argumentos requeridos:
                    DashboardScreen(
                        viewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
                        onStockClick = { symbol ->
                            // Aquí manejas la navegación al detalle o acción seleccionada
                        }
                    )
                }
            }
        }
    }
}