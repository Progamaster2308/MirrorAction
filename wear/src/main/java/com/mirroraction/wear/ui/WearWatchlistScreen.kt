package com.mirroraction.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.*
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.foundation.lazy.AutoCenteringParams
import com.mirroraction.core.model.StockQuote
import java.util.Locale

@Composable
fun WearWatchlistScreen(
    viewModel: WearWatchlistViewModel,
    onStockClick: (String) -> Unit
) {
    val favorites by viewModel.favoriteQuotes.collectAsState()
    var selectedIndex by remember { mutableStateOf(0) }
    var showListMode by remember { mutableStateOf(false) }

    Scaffold(
        timeText = {
            TimeText(
                timeTextStyle = TimeTextDefaults.timeTextStyle(
                    color = Color(0xFF8E8E93),
                    fontSize = 11.sp
                )
            )
        }
    ) {
        if (favorites.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0A0A0A)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Sin favoritos.\nMarca acciones en el móvil.",
                    fontSize = 11.sp,
                    color = Color(0xFF8E8E93),
                    textAlign = TextAlign.Center
                )
            }
        } else if (!showListMode) {
            // Vista principal: Dial Circular idéntico a la imagen de referencia (image_523f7a20.png)
            val currentStock = favorites.getOrElse(selectedIndex.coerceIn(0, favorites.lastIndex)) { favorites.first() }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0A0A0A))
                    .clickable {
                        // Al tocar cambia a la siguiente acción favorita
                        selectedIndex = (selectedIndex + 1) % favorites.size
                    },
                contentAlignment = Alignment.Center
            ) {
                // Dial circular exterior con borde azul brillante (#00E5FF)
                Box(
                    modifier = Modifier
                        .size(136.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF0E0E12))
                        .border(
                            width = 2.dp,
                            color = Color(0xFF00E5FF).copy(alpha = 0.85f),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        // Símbolo del Ticker en Cyan Neón
                        Text(
                            text = currentStock.symbol,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF00E5FF),
                            letterSpacing = 1.sp
                        )

                        Spacer(modifier = Modifier.height(2.dp))

                        // Precio actual en Blanco Neón
                        Text(
                            text = "$%.1f".format(Locale.US, currentStock.price),
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )

                        Spacer(modifier = Modifier.height(2.dp))

                        // Cambio Porcentual en Verde / Rojo
                        val isPositive = currentStock.change >= 0
                        Text(
                            text = "${if (isPositive) "+" else ""}${currentStock.changePercent}%",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isPositive) Color(0xFF00E676) else Color(0xFFFF5252)
                        )
                    }
                }

                // Indicador de cantidad de acciones favoritas en la parte inferior
                Text(
                    text = "${selectedIndex + 1}/${favorites.size} • Toca para cambiar",
                    fontSize = 9.sp,
                    color = Color(0xFF555555),
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 6.dp)
                )
            }
        } else {
            // Modo Lista detallada
            val listState = rememberScalingLazyListState()
            ScalingLazyColumn(
                state = listState,
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0A0A0A)),
                autoCentering = AutoCenteringParams(itemIndex = 0),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                item {
                    Text(
                        text = "FAVORITOS",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF00E5FF),
                        textAlign = TextAlign.Center,
                        letterSpacing = 1.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 2.dp)
                    )
                }

                items(favorites.size) { index ->
                    val stock = favorites[index]
                    WearStockRow(
                        stock = stock,
                        onClick = {
                            selectedIndex = index
                            showListMode = false
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun WearStockRow(
    stock: StockQuote,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 44.dp)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(
                text = stock.symbol,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = stock.name.take(8),
                fontSize = 9.sp,
                color = Color(0xFF8E8E93)
            )
        }

        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = "$%.1f".format(Locale.US, stock.price),
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            val isPositive = stock.change >= 0
            Text(
                text = "${if (isPositive) "+" else ""}${stock.changePercent}%",
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isPositive) Color(0xFF00E676) else Color(0xFFFF5252)
            )
        }
    }
}