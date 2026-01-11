//This asynchronous arrow function getDataFromLobster() makes an API call to lobster to get the new stories
const getDataFromLobster = async () => {
  try {
    //Fetch data from API and wait for it to finish.Save the value returned by the api call in a variable named 'response'.
    const response = await fetch("https://lobste.rs/newest.json"); //Getting data from API takes time so we use the await keyword
    //Guard Clause Reference : https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    if (!response.ok) {
      console.error(`Response status: ${response.status}`);
      return; // Exit early //Reference : https://dev.to/muthuraja_r/using-guard-clauses-in-asyncawait-a-clean-coding-technique-for-readable-and-maintainable-code-367j
    }
    //convert response into JSON notation wait for this line ' await response.json();' to finish before we move to next line
    const data = await response.json();
    //print data on console
    console.log("data from lobster API ", data);
    return data;
  } catch (error) {
    console.log("Error Fetching API: " + error);
  }
};

const storeDataFromLobster = async () => {
  let array = await getDataFromLobster();
  console.log("array", array);
  const lobsterData = array.map((item) => ({
    title: item.title,
    score: item.score,
    date: item.created_at,
  }));
  console.log("lobsterData", lobsterData);
  return lobsterData;
};

export default storeDataFromLobster;
