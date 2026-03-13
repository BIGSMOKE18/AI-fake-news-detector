import { useState, useEffect } from "react";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [history, setHistory] = useState([]);

  // =============================
  // Load Prediction History
  // =============================

  const loadHistory = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/history");
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.log("Could not load history");
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // =============================
  // Predict News
  // =============================

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      setResult(data);

      loadHistory(); // refresh history

    } catch (error) {
      alert("Backend not reachable");
    }

    setLoading(false);
  };

  // =============================
  // Fetch Model Metrics
  // =============================

  const fetchMetrics = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/metrics");
      const data = await response.json();
      setMetrics(data);
      setShowMetrics(true);
    } catch (error) {
      alert("Could not load metrics");
    }
  };

  // =============================
  // Explainable Highlight
  // =============================

  const highlightText = () => {
    if (!result) return text;

    let highlighted = text;

    result.important_words.forEach((word) => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedWord})`, "gi");

      highlighted = highlighted.replace(
        regex,
        `<span class="highlight">$1</span>`
      );
    });

    return highlighted;
  };

  return (
    <div className="app">
      <div className="card">

        <h1 className="title">Explainable AI Fake News Detector</h1>

        <textarea
          placeholder="Paste your news article here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze News"}
        </button>

        <button className="metrics-btn" onClick={fetchMetrics}>
          View Model Performance
        </button>

        {/* =============================
           Prediction Result
        ============================== */}

        {result && (
          <div className="result">

            <h2>
              Prediction:{" "}
              <span className={result.prediction === "Real News" ? "real" : "fake"}>
                {result.prediction}
              </span>
            </h2>

            <p className="confidence">
              Confidence: {result.confidence}%
            </p>

            <h3>Important Words</h3>

            <div className="words">
              {result.important_words.map((word, index) => (
                <span key={index} className="word">
                  {word}
                </span>
              ))}
            </div>

            <h3>Explainable AI Highlight</h3>

            <div
              className="highlighted-text"
              dangerouslySetInnerHTML={{ __html: highlightText() }}
            ></div>

          </div>
        )}

        {/* =============================
           Model Metrics
        ============================== */}

        {showMetrics && metrics && (
          <div className="metrics">

            <h2>Model Performance</h2>

            <div className="metric-box">
              <p>Accuracy: {metrics.accuracy}</p>
              <p>Precision: {metrics.precision}</p>
              <p>Recall: {metrics.recall}</p>
              <p>F1 Score: {metrics.f1_score}</p>
            </div>

          </div>
        )}

        {/* =============================
           Prediction History
        ============================== */}

        <div className="history">

          <h2>Recent Predictions</h2>

          <table>

            <thead>
              <tr>
                <th>News Text</th>
                <th>Prediction</th>
                <th>Confidence</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td>{item.text}</td>
                  <td>{item.prediction}</td>
                  <td>{item.confidence}%</td>
                  <td>{item.timestamp}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}

export default App;