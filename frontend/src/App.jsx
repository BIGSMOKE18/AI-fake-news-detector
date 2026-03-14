import { useState, useEffect } from "react";

const API = "https://ai-fake-news-detector-x65i.onrender.com";

function App() {

const [text,setText] = useState("");
const [result,setResult] = useState(null);
const [loading,setLoading] = useState(false);
const [metrics,setMetrics] = useState(null);
const [showMetrics,setShowMetrics] = useState(false);
const [history,setHistory] = useState([]);

const loadHistory = async ()=>{
  try{
    const res = await fetch(`${API}/history`);
    const data = await res.json();
    setHistory(data);
  }catch(err){
    console.log("history failed");
  }
};

useEffect(()=>{
  loadHistory();
},[]);

const handleSubmit = async()=>{

if(!text.trim()) return;

setLoading(true);
setResult(null);

try{

const res = await fetch(`${API}/predict`,{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({text})
});

const data = await res.json();
setResult(data);
loadHistory();

}catch(err){
alert("Backend unreachable");
}

setLoading(false);
};

const fetchMetrics = async()=>{

try{

const res = await fetch(`${API}/metrics`);
const data = await res.json();

setMetrics(data);
setShowMetrics(true);

}catch(err){
alert("Metrics unavailable");
}

};

return (

<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex justify-center items-start p-10">

<div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl w-[900px] p-10 text-white">

<h1 className="text-3xl font-semibold text-center mb-6">
🧠 Explainable AI Fake News Detector
</h1>

<textarea
className="w-full p-4 rounded-xl text-black h-40"
placeholder="Paste news article..."
value={text}
onChange={(e)=>setText(e.target.value)}
/>

<div className="flex gap-4 mt-4">

<button
onClick={handleSubmit}
className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl"
>
{loading ? "Analyzing..." : "Analyze News"}
</button>

<button
onClick={fetchMetrics}
className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-xl"
>
Model Metrics
</button>

</div>

{result && (

<div className="mt-8 bg-white/10 p-6 rounded-xl">

<h2 className="text-xl mb-2">

Prediction :

<span className={`ml-2 font-bold ${result.prediction==="Real News"?"text-green-400":"text-red-400"}`}>
{result.prediction}
</span>

</h2>

<p className="text-gray-300">
Confidence : {result.confidence}%
</p>

<h3 className="mt-4 mb-2 font-semibold">
Important Words
</h3>

<div className="flex flex-wrap gap-2">

{result.important_words.map((w,i)=>(
<span key={i} className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm">
{w}
</span>
))}

</div>

</div>

)}

{showMetrics && metrics && (

<div className="mt-8 bg-white/10 p-6 rounded-xl">

<h2 className="text-xl mb-3">Model Performance</h2>

<div className="grid grid-cols-2 gap-4">

<p>Accuracy : {metrics.accuracy}</p>
<p>Precision : {metrics.precision}</p>
<p>Recall : {metrics.recall}</p>
<p>F1 Score : {metrics.f1_score}</p>

</div>

</div>

)}

<div className="mt-10">

<h2 className="text-xl mb-3">Recent Predictions</h2>

<div className="max-h-60 overflow-auto">

<table className="w-full text-sm">

<thead>

<tr className="text-left text-gray-300">
<th>Text</th>
<th>Prediction</th>
<th>Conf</th>
<th>Time</th>
</tr>

</thead>

<tbody>

{history.map((item,i)=>(

<tr key={i} className="border-t border-gray-700">

<td className="truncate max-w-[250px]">{item.text}</td>
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

</div>

);

}

export default App;