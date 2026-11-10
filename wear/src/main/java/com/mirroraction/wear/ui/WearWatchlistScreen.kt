package com.mirroraction.wear.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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

@Composable
fun WearWatchlistScreen(
    viewModel: WearWatchlistViewModel,
    onStockClick: (String) -> Unit
) {
    val favorites by viewModel.favoriteQuotes.collectAsState()
    val listState = rememberScalingLazyListState()

    Scaffold(
        timeText = { TimeText(timeTextStyle = TimeTextDefaults.timeTextStyle(color = Color(0xFF8E8E93))) },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) }
    ) {
        ScalingLazyColumn(
            state = listState,
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black),
            autoCentering = AutoCenteringParams(itemIndex = 0),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            item {
                Text(
                    text = "FAVORITOS",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF8E8E93),
                    textAlign = TextAlign.Center,
                    letterSpacing = 1.sp,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 2.dp)
                )
            }

            if (favorites.isEmpty()) {
                item {
                    Text(
                        text = "Sin favoritos.\nMarca acciones en tu móvil.",
                        fontSize = 11.sp,
                        color = Color(0xFF8E8E93),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth().padding(16.dp)
                    )
                }
            } else {
                items(favorites.size) { index ->
                    val stock = favorites[index]
                    WearStockRow(
                        stock = stock,
                        onClick = { onStockClick(stock.symbol) }
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
            .heightIn(min = 48.dp)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(
                text = stock.symbol,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = stock.name.take(6),
                fontSize = 10.sp,
                color = Color(0xFF8E8E93)
            )
        }

        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = "$%.1f".format(stock.price),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "${if (stock.change >= 0) "+" else ""}${stock.changePercent}%",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = if (stock.change >= 0) Color(0xFF30D158) else Color(0xFFFF453A)
            )
        }
    }
}