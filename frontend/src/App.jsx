import { useState, useEffect, useRef } from "react";
import "./App.css";

const API = "https://ai-fake-news-detector-x65i.onrender.com";

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [history, setHistory] = useState([]);
  const fillRef = useRef(null);

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API}/history`);
      const data = await res.json();
      setHistory(data);
    } catch {
      console.log("history failed");
    }
  };

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    if (result && fillRef.current) {
      fillRef.current.style.width = "0%";
      setTimeout(() => {
        if (fillRef.current)
          fillRef.current.style.width = parseFloat(result.confidence).toFixed(2) + "%";
      }, 80);
    }
  }, [result]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
      loadHistory();
    } catch {
      alert("Backend unreachable");
    }
    setLoading(false);
  };

  const fetchMetrics = async () => {
    if (showMetrics) { setShowMetrics(false); return; }
    try {
      const res = await fetch(`${API}/metrics`);
      const data = await res.json();
      setMetrics(data);
      setShowMetrics(true);
    } catch {
      alert("Metrics unavailable");
    }
  };

  const isFake = result?.prediction?.toLowerCase().includes("fake");
  const conf = result ? parseFloat(result.confidence).toFixed(2) : 0;

  return (
    <div className="fd-page">
      <div className="fd-container">

        {/* Nav */}
        <nav className="fd-nav">
          <div className="fd-brand">
            <span className="fd-brand-dot" />
            <span className="fd-brand-name">FakeLens</span>
          </div>
          <span className="fd-nav-tag">v2.0 · Live</span>
        </nav>

        {/* Hero */}
        <div className="fd-hero">
          <p className="fd-hero-eyebrow">Explainable AI · NLP Classification</p>
          <h1 className="fd-hero-title">
            Is this news<br />
            <em>real or fabricated?</em>
          </h1>
          <p className="fd-hero-sub">
            Paste any article or headline. Our model analyzes language patterns
            and returns a verdict with explainability in seconds.
          </p>
        </div>

        <div className="fd-rule" />

        {/* Input */}
        <div className="fd-section">
          <label className="fd-field-label">Article or headline</label>
          <div className="fd-ta-card">
            <div className="fd-ta-bar">
              <span className="fd-ta-dot" /><span className="fd-ta-dot" /><span className="fd-ta-dot" />
              <span className="fd-ta-filename">input.txt</span>
            </div>
            <textarea
              className="fd-textarea"
              placeholder="Paste your news article here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
            />
            <div className="fd-ta-footer">{text.length} characters</div>
          </div>

          <div className="fd-btns">
            <button
              className="fd-btn fd-btn-primary"
              onClick={handleSubmit}
              disabled={loading || text.trim().length < 5}
            >
              {loading ? (
                <><span className="fd-spin">⟳</span> Analyzing…</>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  Analyze News
                </>
              )}
            </button>
            <button
              className={`fd-btn fd-btn-ghost ${showMetrics ? "on" : ""}`}
              onClick={fetchMetrics}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" />
              </svg>
              Metrics
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="fd-result-card fd-animate">

            <div className="fd-result-top">
              <div className="fd-result-left">
                <div className={`fd-verdict-icon ${isFake ? "fake" : "real"}`}>
                  {isFake ? "⚠" : "✓"}
                </div>
                <div>
                  <div className="fd-verdict-eyebrow">Verdict</div>
                  <div className={`fd-verdict-title ${isFake ? "fake" : "real"}`}>
                    {result.prediction}
                  </div>
                </div>
              </div>
              <div className="fd-conf-pill">{conf}% confidence</div>
            </div>

            <div className="fd-conf-section">
              <div className="fd-conf-row">
                <span className="fd-mono-label">Confidence score</span>
                <span className="fd-conf-val">{conf}%</span>
              </div>
              <div className="fd-bar">
                <div className="fd-fill" ref={fillRef} style={{ width: "0%" }} />
              </div>
            </div>

            {result.important_words?.length > 0 && (
              <div className="fd-words-section">
                <div className="fd-mono-label">Key signal words</div>
                <div className="fd-chips">
                  {result.important_words.map((w, i) => (
                    <span key={i} className="fd-chip">{w}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metrics */}
        {showMetrics && metrics && (
          <div className="fd-metrics-card fd-animate">
            <div className="fd-card-header">
              <span className="fd-mono-label">Model performance</span>
            </div>
            <div className="fd-metrics-grid">
              {[
                ["Accuracy", metrics.accuracy],
                ["Precision", metrics.precision],
                ["Recall", metrics.recall],
                ["F1 Score", metrics.f1_score],
              ].map(([label, val]) => (
                <div key={label} className="fd-metric-cell">
                  <div className="fd-metric-name">{label}</div>
                  <div className="fd-metric-val">
                    {typeof val === "number" ? val.toFixed(4) : val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div className="fd-history-card">
          <div className="fd-history-header">
            <span className="fd-mono-label">Recent predictions</span>
            <span className="fd-count-pill">{history.length} {history.length === 1 ? "entry" : "entries"}</span>
          </div>
          {history.length === 0 ? (
            <div className="fd-empty">No predictions yet — run your first analysis above</div>
          ) : (
            <div className="fd-table-wrap">
              <table className="fd-table">
                <thead>
                  <tr>
                    <th>Text</th>
                    <th>Prediction</th>
                    <th>Conf</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => {
                    const fake = item.prediction?.toLowerCase().includes("fake");
                    return (
                      <tr key={i}>
                        <td className="td-text">{item.text}</td>
                        <td>
                          <span className={`fd-tbadge ${fake ? "fake" : "real"}`}>
                            {item.prediction}
                          </span>
                        </td>
                        <td className="td-conf">{item.confidence}%</td>
                        <td className="td-time">{item.timestamp}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}