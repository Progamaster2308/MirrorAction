package com.mirroraction.wear.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.CompactButton
import androidx.wear.compose.material.Text
import com.mirroraction.core.model.StockQuote

@Composable
fun WearDetailScreen(
    stock: StockQuote,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(top = 20.dp, bottom = 12.dp, start = 16.dp, end = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Ticker & Precio tabular en blanco puro
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = stock.symbol,
                fontSize = 12.sp,
                color = Color(0xFF8E8E93),
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = "$%.2f".format(stock.price),
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = stock.formattedChange,
                fontSize = 12.sp,
                color = if (stock.isPositive) Color(0xFF30D158) else Color(0xFFFF453A),
                fontWeight = FontWeight.Medium
            )
        }

        // Gráfico minimalista de barras finas sin resplandor difuso
        CleanBarChart(
            values = stock.sparkline.ifEmpty { listOf(138.0, 139.5, 140.2, 141.0, 141.5) },
            modifier = Modifier
                .fillMaxWidth(0.75f)
                .height(40.dp)
        )

        // Botón de retorno táctil de 48dp
        CompactButton(
            onClick = onBack,
            modifier = Modifier.size(40.dp)
        ) {
            Text("✕", fontSize = 13.sp, color = Color.White)
        }
    }
}

@Composable
fun CleanBarChart(
    values: List<Double>,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        if (values.isEmpty()) return@Canvas
        val min = values.minOrNull() ?: 0.0
        val max = values.maxOrNull() ?: 1.0
        val range = (max - min).coerceAtLeast(0.01)

        val barCount = values.size
        val barWidth = 3.dp.toPx()
        val spacing = (size.width - (barWidth * barCount)) / (barCount - 1).coerceAtLeast(1)

        values.forEachIndexed { i, v ->
            val fraction = ((v - min) / range).coerceIn(0.15, 1.0).toFloat()
            val barHeight = size.height * fraction
            val x = i * (barWidth + spacing)
            val y = size.height - barHeight

            drawRoundRect(
                color = if (i == values.size - 1) Color(0xFF00E5FF) else Color(0xFF52525B),
                topLeft = Offset(x, y),
                size = Size(barWidth, barHeight),
                cornerRadius = CornerRadius(1.dp.toPx())
            )
        }
    }
}
