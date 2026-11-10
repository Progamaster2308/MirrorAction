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
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. Barra de búsqueda sobria
            item {
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = viewModel::onSearchQueryChanged,
                    placeholder = { Text("Buscar símbolo o nombre...", color = TextMuted) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(DarkSurface),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = AccentCyan,
                        unfocusedBorderColor = HairlineBorder
                    ),
                    singleLine = true
                )
            }

            // 2. Tarjetas de resumen del mercado (superficies planas sin resplandores)
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(state.marketIndices) { idx ->
                        Card(
                            modifier = Modifier
                                .width(130.dp)
                                .border(1.dp, HairlineBorder, RoundedCornerShape(8.dp)),
                            colors = CardDefaults.cardColors(containerColor = DarkSurface)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(idx.name, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = TextMuted)
                                Text("$%.2f".format(idx.value), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextWhite)
                                Text(
                                    "%+.2f%%".format(idx.changePercent),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (idx.changePercent >= 0) CleanGreen else CleanRed
                                )
                            }
                        }
                    }
                }
            }

            // 3. Segmented control plano
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DarkSurface, RoundedCornerShape(8.dp))
                        .border(1.dp, HairlineBorder, RoundedCornerShape(8.dp))
                        .padding(2.dp)
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

            // 4. Catálogo de acciones: Lista plana compacta separada por divisores finos
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, HairlineBorder, RoundedCornerShape(10.dp)),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface)
                ) {
                    Column {
                        state.stocks.forEachIndexed { index, stock ->
                            StockRowItem(
                                stock = stock,
                                onClick = { onStockClick(stock.symbol) },
                                onFavoriteToggle = { viewModel.toggleFavorite(stock) }
                            )
                            if (index < state.stocks.size - 1) {
                                HorizontalDivider(color = DividerColor, thickness = 1.dp)
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
            .clip(RoundedCornerShape(6.dp))
            .background(if (isSelected) Color(0xFF222226) else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            fontSize = 12.sp,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
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
            .padding(horizontal = 14.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        // Ticker en blanco puro y nombre debajo en #8E8E93
        Column(modifier = Modifier.weight(1f)) {
            Text(stock.symbol, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TextWhite)
            Text(stock.name, fontSize = 12.sp, color = TextMuted, maxLines = 1)
        }

        // Gráfico Sparkline fino y funcional
        CleanSparkline(
            points = stock.sparkline.ifEmpty { listOf(100.0, 102.0, 101.5, 104.0, 105.0) },
            isPositive = stock.isPositive,
            modifier = Modifier
                .width(56.dp)
                .height(20.dp)
                .padding(horizontal = 4.dp)
        )

        // Precio y cambio porcentual alineados a la derecha
        Column(horizontalAlignment = Alignment.End, modifier = Modifier.padding(start = 8.dp)) {
            Text("$%.2f".format(stock.price), fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextWhite)
            Text(
                stock.formattedChange,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = if (stock.isPositive) CleanGreen else CleanRed
            )
        }

        IconButton(onClick = onFavoriteToggle, modifier = Modifier.size(36.dp)) {
            Icon(
                imageVector = if (stock.isFavorite) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                contentDescription = "Favorito",
                tint = if (stock.isFavorite) AccentCyan else TextMuted,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

@Composable
fun CleanSparkline(points: List<Double>, isPositive: Boolean, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        if (points.size < 2) return@Canvas
        val min = points.minOrNull() ?: 0.0
        val max = points.maxOrNull() ?: 1.0
        val range = (max - min).coerceAtLeast(0.01)

        val path = Path()
        val stepX = size.width / (points.size - 1)

        points.forEachIndexed { i, value ->
            val x = i * stepX
            val y = size.height - ((value - min) / range * size.height).toFloat()
            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }

        drawPath(
            path = path,
            color = if (isPositive) CleanGreen else CleanRed,
            style = Stroke(width = 1.5.dp.toPx())
        )
    }
}