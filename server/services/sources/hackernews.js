const getDataFromHackerNewsAPI = async () => {
  try {
    //Fetch data from API and wait for it to finish.Save the value returned by the api call in a variable named 'response'.
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/beststories.json?print=pretty"
    ); //Getting data from API takes time so we use the await keyword
    //Guard Clause Reference : https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    if (!response.ok) {
      console.error(`Response status: ${response.status}`);
      return; // Exit early //Reference : https://dev.to/muthuraja_r/using-guard-clauses-in-asyncawait-a-clean-coding-technique-for-readable-and-maintainable-code-367j
    }
    //convert response into JSON notation wait for this line ' await response.json();' to finish before we move to next line
    const data = await response.json();
    //print data on console
    console.log("data", data);
    return data;
  } catch (error) {
    console.log("Error Fetching API: " + error);
  }
};

const storeNewsFromHacker = async () => {
  //Get data from hackerNewsAPI
  let hackerNewsData = await getDataFromHackerNewsAPI();
  //get first 20 items from hackerNewsData
  const twentyItemsData = hackerNewsData.slice(0, 19);
  console.log("Hello", twentyItemsData);
  //Go in each story and get score/rank
  for (let item of twentyItemsData) {
    console.log("item", item);
    await getDataForItem(item);
  }
};

const getDataForItem = async (item) => {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${item}.json`
  );
  const data = await response.json();
  //print data on console
  console.log("data title : ", data.title);
};

const hackerNewsData = storeNewsFromHacker();
