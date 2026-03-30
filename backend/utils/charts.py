# charts.py
# This file generates matplotlib charts and returns them as base64 strings.
# Base64 means the image is converted to a long text string that can be
# sent over an API and displayed directly in React as an <img> tag.
# No files are saved to disk — everything stays in memory.

import matplotlib
matplotlib.use("Agg")  # use non-interactive backend — required for servers
                       # without this matplotlib tries to open a GUI window
                       # and crashes because servers have no display

import matplotlib.pyplot as plt
import matplotlib.dates  as mdates
import pandas            as pd
import numpy             as np
import io      # lets us treat memory like a file
import base64  # converts image bytes to a text string


# ── Helper: convert a matplotlib figure to base64 string ─────────────
def fig_to_base64(fig) -> str:
    # Create an in-memory buffer — like a fake file in RAM
    buffer = io.BytesIO()

    # Save the figure into the buffer instead of a real file
    fig.savefig(
        buffer,
        format="png",
        dpi=150,              # high resolution
        bbox_inches="tight",  # remove extra whitespace around chart
        facecolor=fig.get_facecolor()  # preserve background color
    )

    # Go back to the start of the buffer so we can read it
    buffer.seek(0)

    # Read the bytes and encode as base64 text string
    image_base64 = base64.b64encode(buffer.read()).decode("utf-8")

    # Close figure and buffer to free memory
    plt.close(fig)
    buffer.close()

    # Return as a data URL — React can use this directly in <img src="...">
    return f"data:image/png;base64,{image_base64}"


# ── CHART 1: Price History + MA20 + MA50 ─────────────────────────────
def generate_price_ma_chart(df: pd.DataFrame, ticker: str) -> str:
    # Set up the figure with a clean light style
    fig, ax = plt.subplots(figsize=(12, 5))
    fig.patch.set_facecolor("#FFFFFF")
    ax.set_facecolor("#FAFAFA")

    # Get the last 6 months of data for a clean view
    df_plot = df.tail(126)  # roughly 6 months of trading days

    # Convert index to datetime for proper x-axis formatting
    dates = pd.to_datetime(df_plot.index)

    # ── Plot closing price ────────────────────────────────────────────
    close = df_plot["Close"].squeeze()
    ax.plot(
        dates, close,
        color="#6366F1",     # indigo — matches our React theme
        linewidth=1.8,
        label="Close Price",
        zorder=3             # draw on top of other elements
    )

    # ── Shade area under close price ─────────────────────────────────
    ax.fill_between(
        dates, close,
        alpha=0.08,
        color="#6366F1"
    )

    # ── Plot MA20 ─────────────────────────────────────────────────────
    ax.plot(
        dates, df_plot["MA20"].squeeze(),
        color="#F59E0B",     # amber
        linewidth=1.4,
        linestyle="--",
        label="MA20",
        alpha=0.85
    )

    # ── Plot MA50 ─────────────────────────────────────────────────────
    ax.plot(
        dates, df_plot["MA50"].squeeze(),
        color="#EF4444",     # red
        linewidth=1.4,
        linestyle="--",
        label="MA50",
        alpha=0.85
    )

    # ── MA Crossover signals ──────────────────────────────────────────
    # When MA20 crosses above MA50 = bullish signal (green dot)
    # When MA20 crosses below MA50 = bearish signal (red dot)
    ma20  = df_plot["MA20"].squeeze().values
    ma50  = df_plot["MA50"].squeeze().values
    close_vals = close.values

    for i in range(1, len(ma20)):
        # Bullish crossover — MA20 just went above MA50
        if ma20[i] > ma50[i] and ma20[i-1] <= ma50[i-1]:
            ax.scatter(
                dates[i], close_vals[i],
                color="#10B981", s=80, zorder=5,
                marker="^",  # upward triangle
                label="_nolegend_"
            )
        # Bearish crossover — MA20 just went below MA50
        elif ma20[i] < ma50[i] and ma20[i-1] >= ma50[i-1]:
            ax.scatter(
                dates[i], close_vals[i],
                color="#EF4444", s=80, zorder=5,
                marker="v",  # downward triangle
                label="_nolegend_"
            )

    # ── Styling ───────────────────────────────────────────────────────
    ax.set_title(
        f"{ticker} — Price History with Moving Averages",
        fontsize=14, fontweight="bold",
        color="#1a1a2e", pad=16
    )
    ax.set_ylabel("Price (USD)", fontsize=11, color="#64748B")
    ax.tick_params(colors="#94A3B8", labelsize=9)
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
    ax.xaxis.set_major_locator(mdates.MonthLocator())
    plt.setp(ax.get_xticklabels(), rotation=30, ha="right")

    # Grid — horizontal only, very subtle
    ax.yaxis.grid(True, color="#E2E8F0", linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#E2E8F0")
    ax.spines["bottom"].set_color("#E2E8F0")

    # Legend
    ax.legend(
        loc="upper left", fontsize=10,
        framealpha=0.9, edgecolor="#E2E8F0"
    )

    # Annotation for crossover signals
    ax.annotate(
        "▲ Bullish crossover   ▼ Bearish crossover",
        xy=(0.98, 0.02), xycoords="axes fraction",
        fontsize=8, color="#94A3B8",
        ha="right", va="bottom"
    )

    plt.tight_layout()
    return fig_to_base64(fig)


# ── CHART 2: LSTM Predicted vs Actual Price ───────────────────────────
def generate_lstm_chart(df: pd.DataFrame, ticker: str, forecast: list) -> str:
    fig, ax = plt.subplots(figsize=(12, 5))
    fig.patch.set_facecolor("#FFFFFF")
    ax.set_facecolor("#FAFAFA")

    # ── Historical actual prices (last 60 days) ───────────────────────
    df_plot    = df.tail(60)
    dates_hist = pd.to_datetime(df_plot.index)
    close      = df_plot["Close"].squeeze()

    ax.plot(
        dates_hist, close,
        color="#6366F1",
        linewidth=2,
        label="Actual Price",
        zorder=3
    )
    ax.fill_between(dates_hist, close, alpha=0.06, color="#6366F1")

    # ── Generate future dates for the forecast ────────────────────────
    last_date    = pd.to_datetime(df.index[-1])
    future_dates = pd.bdate_range(   # bdate = business days only (no weekends)
        start=last_date + pd.Timedelta(days=1),
        periods=len(forecast)
    )

    # ── Plot 30-day LSTM forecast ─────────────────────────────────────
    ax.plot(
        future_dates, forecast,
        color="#F59E0B",
        linewidth=2,
        linestyle="--",
        label="LSTM 30-Day Forecast",
        zorder=3
    )
    ax.fill_between(future_dates, forecast, alpha=0.08, color="#F59E0B")

    # ── Vertical line separating historical from forecast ─────────────
    ax.axvline(
        x=last_date,
        color="#CBD5E1",
        linewidth=1.5,
        linestyle=":",
        zorder=2
    )
    ax.text(
        last_date, ax.get_ylim()[1] * 0.98,
        " Today",
        fontsize=9, color="#94A3B8",
        va="top"
    )

    # ── Shade the forecast region ─────────────────────────────────────
    ax.axvspan(
        last_date, future_dates[-1],
        alpha=0.04, color="#F59E0B"
    )

    # ── Forecast summary annotation ───────────────────────────────────
    start_price = float(close.iloc[-1])
    end_price   = float(forecast[-1])
    change_pct  = ((end_price - start_price) / start_price) * 100
    direction   = "↑" if change_pct >= 0 else "↓"
    color_ann   = "#10B981" if change_pct >= 0 else "#EF4444"

    ax.annotate(
        f"30-day forecast: {direction} {abs(change_pct):.1f}%\n"
        f"${start_price:.2f} → ${end_price:.2f}",
        xy=(future_dates[-1], end_price),
        xytext=(-80, -40),
        textcoords="offset points",
        fontsize=9,
        color=color_ann,
        fontweight="bold",
        arrowprops=dict(arrowstyle="->", color=color_ann, lw=1.2)
    )

    # ── Styling ───────────────────────────────────────────────────────
    ax.set_title(
        f"{ticker} — LSTM 30-Day Price Forecast",
        fontsize=14, fontweight="bold",
        color="#1a1a2e", pad=16
    )
    ax.set_ylabel("Price (USD)", fontsize=11, color="#64748B")
    ax.tick_params(colors="#94A3B8", labelsize=9)
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=2))
    plt.setp(ax.get_xticklabels(), rotation=30, ha="right")

    ax.yaxis.grid(True, color="#E2E8F0", linewidth=0.8)
    ax.set_axisbelow(True)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#E2E8F0")
    ax.spines["bottom"].set_color("#E2E8F0")

    ax.legend(loc="upper left", fontsize=10, framealpha=0.9, edgecolor="#E2E8F0")

    plt.tight_layout()
    return fig_to_base64(fig)