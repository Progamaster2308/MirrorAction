package com.mirroraction.ui.dashboard

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirroraction.core.model.StockQuote
import com.mirroraction.ui.theme.*

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onStockClick: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    Scaffold(
        containerColor = PureBlack,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding() // Protege contra notch y punch hole de la cámara
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Text(
                    text = "MirrorAction",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextWhite,
                    letterSpacing = (-0.5).sp
                )
                Text(
                    text = "Mercado Global en Tiempo Real",
                    fontSize = 12.sp,
                    color = TextMuted
                )
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. Barra de Búsqueda
            item {
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = viewModel::onSearchQueryChanged,
                    placeholder = { Text("Buscar símbolo o nombre...", color = TextMuted, fontSize = 13.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = AccentCyan) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(DarkSurface),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = DarkSurface,
                        unfocusedContainerColor = DarkSurface,
                        focusedBorderColor = AccentCyan,
                        unfocusedBorderColor = HairlineBorder,
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite
                    ),
                    singleLine = true
                )
            }

            // 2. Tarjetas de Resumen de Mercado (S&P 500, NASDAQ, Dow Jones)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    state.marketIndices.forEach { idx ->
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .border(1.dp, HairlineBorder, RoundedCornerShape(10.dp)),
                            colors = CardDefaults.cardColors(containerColor = DarkSurface),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = idx.name,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextMuted,
                                    maxLines = 1
                                )
                                Text(
                                    text = "$%.2f".format(idx.value),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextWhite,
                                    maxLines = 1
                                )
                                Text(
                                    text = "%+.2f%%".format(idx.changePercent),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (idx.changePercent >= 0) CleanGreen else CleanRed,
                                    maxLines = 1
                                )
                            }
                        }
                    }
                }
            }

            // 3. Segmented control
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DarkSurface, RoundedCornerShape(10.dp))
                        .border(1.dp, HairlineBorder, RoundedCornerShape(10.dp))
                        .padding(3.dp)
                ) {
                    TabButton(
                        text = "Todas",
                        isSelected = state.selectedTab == DashboardTab.ALL,
                        onClick = { viewModel.selectTab(DashboardTab.ALL) },
                        modifier = Modifier.weight(1f)
                    )
                    TabButton(
                        text = "Favoritos",
                        isSelected = state.selectedTab == DashboardTab.WATCHLIST,
                        onClick = { viewModel.selectTab(DashboardTab.WATCHLIST) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // 4. Catálogo de acciones: Lista poblada
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, HairlineBorder, RoundedCornerShape(12.dp)),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column {
                        state.stocks.forEachIndexed { index, stock ->
                            StockRowItem(
                                stock = stock,
                                onClick = { onStockClick(stock.symbol) },
                                onFavoriteToggle = { viewModel.toggleFavorite(stock) }
                            )
                            if (index < state.stocks.size - 1) {
                                HorizontalDivider(color = HairlineBorder, thickness = 0.8.dp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TabButton(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(if (isSelected) Color(0xFF222226) else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            fontSize = 12.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) TextWhite else TextMuted
        )
    }
}

@Composable
fun StockRowItem(
    stock: StockQuote,
    onClick: () -> Unit,
    onFavoriteToggle: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1.2f)) {
            Text(
                text = stock.symbol,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = TextWhite
            )
            Text(
                text = stock.name,
                fontSize = 11.sp,
                color = TextMuted,
                maxLines = 1
            )
        }

        // Mini Gráfico Sparkline
        Canvas(
            modifier = Modifier
                .weight(0.8f)
                .height(20.dp)
                .padding(horizontal = 6.dp)
        ) {
            val isPos = stock.change >= 0
            val strokeColor = if (isPos) CleanGreen else CleanRed
            val w = size.width
            val h = size.height
            val path = Path().apply {
                moveTo(0f, if (isPos) h * 0.8f else h * 0.2f)
                lineTo(w * 0.35f, if (isPos) h * 0.6f else h * 0.4f)
                lineTo(w * 0.65f, if (isPos) h * 0.7f else h * 0.3f)
                lineTo(w, if (isPos) h * 0.15f else h * 0.85f)
            }
            drawPath(path, color = strokeColor, style = Stroke(width = 2.dp.toPx()))
        }

        Column(
            modifier = Modifier.weight(1f),
            horizontalAlignment = Alignment.End
        ) {
            Text(
                text = "$%.2f".format(stock.price),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextWhite
            )
            Text(
                text = "%+.2f%%".format(stock.changePercent),
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (stock.change >= 0) CleanGreen else CleanRed
            )
        }

        IconButton(
            onClick = onFavoriteToggle,
            modifier = Modifier.size(36.dp)
        ) {
            Icon(
                imageVector = if (stock.isFavorite) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                contentDescription = null,
                tint = if (stock.isFavorite) AccentCyan else TextMuted
            )
        }
    }
}