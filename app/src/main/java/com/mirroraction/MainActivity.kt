package com.mirroraction

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mirroraction.ui.auth.LoginScreen
import com.mirroraction.ui.dashboard.DashboardScreen
import com.mirroraction.ui.dashboard.DashboardViewModel
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
                    var isLoggedIn by remember { mutableStateOf(false) }
                    var loggedInUser by remember { mutableStateOf("") }
                    var loggedInEmail by remember { mutableStateOf("") }

                    if (!isLoggedIn) {
                        LoginScreen(
                            onLoginSuccess = { user, email ->
                                loggedInUser = user
                                loggedInEmail = email
                                isLoggedIn = true
                            }
                        )
                    } else {
                        val dashboardViewModel: DashboardViewModel = viewModel()
                        DashboardScreen(
                            viewModel = dashboardViewModel,
                            onStockClick = { symbol ->
                                // Navegación a vista detallada
                            }
                        )
                    }
                }
            }
        }
    }
}