import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

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
