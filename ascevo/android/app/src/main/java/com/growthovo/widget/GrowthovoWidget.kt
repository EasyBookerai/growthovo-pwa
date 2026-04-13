package com.growthovo.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import org.json.JSONObject
import java.time.Instant
import java.time.temporal.ChronoUnit

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

data class WidgetData(
    val streak: Int,
    val xp: Int,
    val hearts: Int,
    val challengeTitle: String,
    val leaguePosition: Int,
    val primaryPillar: String,
    val rexDailyLine: String,
    val updatedAt: String
)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

private const val WIDGET_DATA_KEY = "@growthovo_widget_data"
private const val PREFS_NAME = "RCTAsyncLocalStorage_V1"
private const val STALE_HOURS = 24L

private val SMALL_SIZE = DpSize(57.dp, 102.dp)
private val MEDIUM_SIZE = DpSize(110.dp, 102.dp)
private val LARGE_SIZE = DpSize(220.dp, 102.dp)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

private fun loadWidgetData(context: Context): WidgetData? {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(WIDGET_DATA_KEY, null) ?: return null
    return try {
        val json = JSONObject(raw)
        WidgetData(
            streak = json.optInt("streak", 0),
            xp = json.optInt("xp", 0),
            hearts = json.optInt("hearts", 0),
            challengeTitle = json.optString("challengeTitle", ""),
            leaguePosition = json.optInt("leaguePosition", 0),
            primaryPillar = json.optString("primaryPillar", "mind"),
            rexDailyLine = json.optString("rexDailyLine", ""),
            updatedAt = json.optString("updatedAt", "")
        )
    } catch (e: Exception) {
        null
    }
}

private fun isStale(data: WidgetData): Boolean {
    return try {
        val updated = Instant.parse(data.updatedAt)
        ChronoUnit.HOURS.between(updated, Instant.now()) >= STALE_HOURS
    } catch (e: Exception) {
        true
    }
}

private fun pillarColor(pillar: String): Color = when (pillar.lowercase()) {
    "mind"          -> Color(0xFF6682FA)
    "discipline"    -> Color(0xFFFA7366)
    "communication" -> Color(0xFF66D9A6)
    "money"         -> Color(0xFFFACC33)
    "relationships" -> Color(0xFFE666D9)
    else            -> Color(0xFF6682FA)
}

// ---------------------------------------------------------------------------
// Composable views
// ---------------------------------------------------------------------------

@Composable
private fun FallbackView() {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(Color.Black)),
        verticalAlignment = Alignment.CenterVertically,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "GROWTHOVO",
            style = TextStyle(
                color = ColorProvider(Color.White),
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        )
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(
            text = "Open GROWTHOVO",
            style = TextStyle(
                color = ColorProvider(Color.Gray),
                fontSize = 11.sp
            )
        )
    }
}

@Composable
private fun SmallView(data: WidgetData) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(Color.Black))
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "GROWTHOVO",
            style = TextStyle(
                color = ColorProvider(Color.White.copy(alpha = 0.6f)),
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp
            )
        )
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(
            text = "🔥 ${data.streak}",
            style = TextStyle(
                color = ColorProvider(Color.White),
                fontWeight = FontWeight.Bold,
                fontSize = 24.sp
            )
        )
        Spacer(modifier = GlanceModifier.height(2.dp))
        Text(
            text = data.rexDailyLine.take(40),
            style = TextStyle(
                color = ColorProvider(Color.Gray),
                fontSize = 9.sp
            ),
            maxLines = 2
        )
    }
}

@Composable
private fun MediumView(data: WidgetData) {
    Row(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(Color.Black))
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Streak
        Column(
            modifier = GlanceModifier.defaultWeight(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "🔥 ${data.streak}",
                style = TextStyle(
                    color = ColorProvider(Color.White),
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp
                )
            )
            Text(
                text = "day streak",
                style = TextStyle(color = ColorProvider(Color.Gray), fontSize = 10.sp)
            )
        }

        Spacer(modifier = GlanceModifier.width(8.dp))

        // XP + hearts
        Column(
            modifier = GlanceModifier.defaultWeight(),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = data.challengeTitle.take(30),
                style = TextStyle(
                    color = ColorProvider(Color.White),
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp
                ),
                maxLines = 1
            )
            Spacer(modifier = GlanceModifier.height(4.dp))
            Text(
                text = "${data.xp} XP",
                style = TextStyle(
                    color = ColorProvider(pillarColor(data.primaryPillar)),
                    fontSize = 11.sp
                )
            )
            Text(
                text = "❤️ ${data.hearts}",
                style = TextStyle(color = ColorProvider(Color.Gray), fontSize = 10.sp)
            )
        }
    }
}

@Composable
private fun LargeView(data: WidgetData) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(Color.Black))
            .padding(12.dp)
    ) {
        // Header
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "GROWTHOVO",
                style = TextStyle(
                    color = ColorProvider(Color.White.copy(alpha = 0.6f)),
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp
                )
            )
            Spacer(modifier = GlanceModifier.defaultWeight())
            Text(
                text = "🏆 #${data.leaguePosition}",
                style = TextStyle(
                    color = ColorProvider(pillarColor(data.primaryPillar)),
                    fontSize = 11.sp
                )
            )
        }

        Spacer(modifier = GlanceModifier.height(6.dp))

        // Streak
        Text(
            text = "🔥 ${data.streak} days",
            style = TextStyle(
                color = ColorProvider(Color.White),
                fontWeight = FontWeight.Bold,
                fontSize = 28.sp
            )
        )

        Spacer(modifier = GlanceModifier.height(6.dp))

        // Stats row
        Row {
            Text(
                text = "${data.xp} XP",
                style = TextStyle(
                    color = ColorProvider(pillarColor(data.primaryPillar)),
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            )
            Spacer(modifier = GlanceModifier.width(12.dp))
            Text(
                text = "❤️ ${data.hearts}",
                style = TextStyle(color = ColorProvider(Color.Red), fontSize = 13.sp)
            )
        }

        Spacer(modifier = GlanceModifier.height(6.dp))

        // Challenge
        Text(
            text = data.challengeTitle,
            style = TextStyle(
                color = ColorProvider(Color.White),
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp
            ),
            maxLines = 2
        )

        Spacer(modifier = GlanceModifier.defaultWeight())

        // Rex line
        Text(
            text = data.rexDailyLine,
            style = TextStyle(
                color = ColorProvider(Color.Gray),
                fontSize = 10.sp
            ),
            maxLines = 2
        )
    }
}

// ---------------------------------------------------------------------------
// GlanceAppWidget
// ---------------------------------------------------------------------------

class GrowthovoWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Responsive(
        setOf(SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE)
    )

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val data = loadWidgetData(context)
        val stale = data == null || isStale(data)

        provideContent {
            val size = LocalSize.current
            when {
                stale || data == null -> FallbackView()
                size.width >= LARGE_SIZE.width -> LargeView(data)
                size.width >= MEDIUM_SIZE.width -> MediumView(data)
                else -> SmallView(data)
            }
        }
    }
}
