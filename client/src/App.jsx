import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  const getLatestTrends = async () => {
    try {
      const response = await fetch("/api/get-latest-trends");
      if (!response.ok) {
        console.error(`Response status: ${response.status}`);
        return; // Exit early //Reference : https://dev.to/muthuraja_r/using-guard-clauses-in-asyncawait-a-clean-coding-technique-for-readable-and-maintainable-code-367j
      }
      //Convert the response to JSON format using json method
      const data = await response.json();
      //print on console
      console.log(data);
    } catch {
      //print error on console
      console.log("Error retrieving user data" + error.message);
    }
  };

  getLatestTrends();

  return (
    <>
      <h1>Emerging Trends</h1>
      <p>
        Find emerging trends <b> before </b> they hit the mainstream.
      </p>
    </>
  );
}

export default App;
