package com.mirroraction.ui.auth

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Watch
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mirroraction.ui.theme.*

private val AccentBlue = Color(0xFF2979FF)

@Composable
fun LoginScreen(
    onLoginSuccess: (username: String, email: String) -> Unit
) {
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var usernameError by remember { mutableStateOf<String?>(null) }
    var emailError by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PureBlack)
            .statusBarsPadding()
            .padding(horizontal = 24.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // 1. Logo y Título de Marca
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(top = 16.dp)
        ) {
            // Icono vectorial reflectivo de MirrorAction
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .background(DarkSurface, RoundedCornerShape(16.dp))
                    .border(1.dp, HairlineBorder, RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.size(36.dp)) {
                    val w = size.width
                    val h = size.height
                    // Faceta izquierda
                    val leftFacet = Path().apply {
                        moveTo(w * 0.28f, h * 0.8f)
                        lineTo(w * 0.15f, h * 0.52f)
                        lineTo(w * 0.48f, h * 0.22f)
                        lineTo(w * 0.48f, h * 0.8f)
                        close()
                    }
                    drawPath(leftFacet, color = AccentBlue.copy(alpha = 0.8f))

                    // Faceta derecha
                    val rightFacet = Path().apply {
                        moveTo(w * 0.52f, h * 0.22f)
                        lineTo(w * 0.85f, h * 0.52f)
                        lineTo(w * 0.72f, h * 0.8f)
                        lineTo(w * 0.52f, h * 0.8f)
                        close()
                    }
                    drawPath(rightFacet, color = AccentCyan)

                    // Flecha central ascendente
                    val arrow = Path().apply {
                        moveTo(w * 0.5f, h * 0.12f)
                        lineTo(w * 0.75f, h * 0.38f)
                        lineTo(w * 0.62f, h * 0.40f)
                        lineTo(w * 0.5f, h * 0.25f)
                        close()
                    }
                    drawPath(arrow, color = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row {
                Text(
                    text = "MIRROR ",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = TextWhite,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "ACTION",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = AccentCyan,
                    letterSpacing = 1.sp
                )
            }

            Text(
                text = "Plataforma de seguimiento bursátil y sincronización en tiempo real con Wear OS.",
                fontSize = 12.sp,
                color = TextMuted,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 6.dp, start = 8.dp, end = 8.dp),
                lineHeight = 16.sp
            )
        }

        // 2. Tarjeta de Formulario de Inicio de Sesión
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HairlineBorder, RoundedCornerShape(20.dp)),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "Iniciar Sesión",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextWhite
                )
                Text(
                    text = "Ingresa tus credenciales para acceder al Dashboard y sincronizar tu reloj.",
                    fontSize = 12.sp,
                    color = TextMuted,
                    modifier = Modifier.padding(top = 2.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Campo Nombre de Usuario
                Text(
                    text = "Nombre de Usuario",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextWhite
                )
                OutlinedTextField(
                    value = username,
                    onValueChange = {
                        username = it
                        usernameError = null
                    },
                    placeholder = { Text("ej. brian_trader", color = TextMuted, fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = AccentCyan) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = PureBlack,
                        unfocusedContainerColor = PureBlack,
                        focusedBorderColor = AccentCyan,
                        unfocusedBorderColor = HairlineBorder,
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite
                    ),
                    isError = usernameError != null,
                    singleLine = true
                )
                if (usernameError != null) {
                    Text(usernameError!!, color = CleanRed, fontSize = 10.sp, modifier = Modifier.padding(start = 4.dp, top = 2.dp))
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Campo Correo Electrónico
                Text(
                    text = "Correo Electrónico",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextWhite
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = {
                        email = it
                        emailError = null
                    },
                    placeholder = { Text("ej. brian@mirroraction.app", color = TextMuted, fontSize = 12.sp) },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = AccentBlue) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = PureBlack,
                        unfocusedContainerColor = PureBlack,
                        focusedBorderColor = AccentCyan,
                        unfocusedBorderColor = HairlineBorder,
                        focusedTextColor = TextWhite,
                        unfocusedTextColor = TextWhite
                    ),
                    isError = emailError != null,
                    singleLine = true
                )
                if (emailError != null) {
                    Text(emailError!!, color = CleanRed, fontSize = 10.sp, modifier = Modifier.padding(start = 4.dp, top = 2.dp))
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Botón Ingresar a MirrorAction
                Button(
                    onClick = {
                        var valid = true
                        if (username.trim().length < 3) {
                            usernameError = "Mínimo 3 caracteres"
                            valid = false
                        }
                        if (!email.contains("@") || !email.contains(".")) {
                            emailError = "Formato de correo inválido"
                            valid = false
                        }
                        if (valid) {
                            onLoginSuccess(username.trim(), email.trim())
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentCyan)
                ) {
                    Text(
                        text = "INGRESAR A MIRRORACTION →",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.Black,
                        letterSpacing = 0.5.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Acceso Rápido Demo
                Text(
                    text = "ACCESO RÁPIDO (DEMO)",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextMuted,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            username = "Brian De Jesús"
                            email = "briandejesuselpro@gmail.com"
                            usernameError = null
                            emailError = null
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = PureBlack,
                            contentColor = TextWhite
                        ),
                        border = borderStroke(1.dp, HairlineBorder)
                    ) {
                        Text("👤 Brian De Jesús", fontSize = 11.sp, maxLines = 1)
                    }

                    OutlinedButton(
                        onClick = {
                            username = "Trader Pro"
                            email = "trader@mirroraction.com"
                            usernameError = null
                            emailError = null
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = PureBlack,
                            contentColor = TextWhite
                        ),
                        border = borderStroke(1.dp, HairlineBorder)
                    ) {
                        Text("📈 Trader Pro", fontSize = 11.sp, maxLines = 1)
                    }
                }
            }
        }

        // 3. Footer con garantía de sincronización
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
            modifier = Modifier.padding(bottom = 8.dp)
        ) {
            Icon(Icons.Default.Watch, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "Sincronización encriptada con Wear OS DataLayer",
                fontSize = 11.sp,
                color = TextMuted
            )
        }
    }
}

private fun borderStroke(width: androidx.compose.ui.unit.Dp, color: Color) =
    androidx.compose.foundation.BorderStroke(width, color)
