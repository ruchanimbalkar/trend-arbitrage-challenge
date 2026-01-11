//This asynchronous arrow function getDataFromLobster() makes an API call to Reddit to get the new stories
const getDataFromReddit = async () => {
  try {
    //Fetch data from API and wait for it to finish.Save the value returned by the api call in a variable named 'response'.
    const response = await fetch(
      "https://www.reddit.com/r/programming/rising/.json"
    ); //Getting data from API takes time so we use the await keyword
    //Guard Clause Reference : https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    if (!response.ok) {
      console.error(`Response status: ${response.status}`);
      return; // Exit early //Reference : https://dev.to/muthuraja_r/using-guard-clauses-in-asyncawait-a-clean-coding-technique-for-readable-and-maintainable-code-367j
    }
    //convert response into JSON notation wait for this line ' await response.json();' to finish before we move to next line
    const data = await response.json();
    //print data on console
    console.log("data from reddit API ", data);
    return data.data.children;
  } catch (error) {
    console.log("Error Fetching API: " + error);
  }
};

const storeDataFromReddit = async () => {
  let array = await getDataFromReddit();
  console.log("array", array);
  const redditData = array.map((item) => ({
    title: item.data.title,
    score: item.data.score,
  }));
  console.log("redditData", redditData);
  return redditData;
};
export default storeDataFromReddit;
