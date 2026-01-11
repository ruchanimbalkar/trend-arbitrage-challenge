import { useEffect, useState } from "react";
import "./App.css";
//import components
import Card from "./components/Card.jsx";

function App() {
  const [refresh, setRefresh] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [url, setUrl] = useState("/api/latest");

  const getLatestTrends = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Response status: ${response.status}`);
        return; // Exit early //Reference : https://dev.to/muthuraja_r/using-guard-clauses-in-asyncawait-a-clean-coding-technique-for-readable-and-maintainable-code-367j
      }
      //Convert the response to JSON format using json method
      const data = await response.json();
      //print on console
      console.log(data);
      setTrendData(data);
    } catch {
      //print error on console
      console.log("Error retrieving user data" + error.message);
    }
  };

  useEffect(() => {
    if (refresh) {
      setUrl("/api/get-latest");
      getLatestTrends();
    }
  }, [refresh]);

  return (
    <>
      <h1>Emerging Trends</h1>
      <p>
        Find emerging trends <b> before </b> they hit the mainstream.
      </p>
      <button onClick={() => setRefresh(true)}> Refresh </button>
      <div className="result-card">
        <h2> Growing topics in descending order: </h2>
        {trendData.map((item, index) => (
          <Card title={item.title} score={item.score} key={"index_" + index} />
        ))}
      </div>
    </>
  );
}

export default App;
