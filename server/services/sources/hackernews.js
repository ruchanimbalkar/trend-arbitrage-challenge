//This asynchronous arrow function getDataFromHackerNewsAPI() makes an API call to hackerNews to get the beststories data
const getDataFromHackerNewsAPI = async () => {
  try {
    //Fetch data from API and wait for it to finish.Save the value returned by the api call in a variable named 'response'.
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty"
    ); //Getting data from API takes time so we use the await keyword
    //Guard Clause Reference : https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    if (!response.ok) {
      console.error(`Response status: ${response.status}`);
      return; // Exit early //Reference : https://dev.to/muthuraja_r/using-guard-clauses-in-asyncawait-a-clean-coding-technique-for-readable-and-maintainable-code-367j
    }
    //convert response into JSON notation wait for this line ' await response.json();' to finish before we move to next line
    const data = await response.json();
    //print data on console
    // test: console.log("data", data);
    return data;
  } catch (error) {
    console.log("Error Fetching API: " + error);
  }
};

/* This asynchronous arrow function storeNewsFromHacker gets the first 20 items from 
the API call made by getDataFromHackerNewsAPI() and stores them in an array.
It iterates through the array and calls a function getDataForItem() to get an object that is stored in an array of objects. 
*/
const storeNewsFromHacker = async () => {
  //Create an empty array named "hackerNewsArray"
  let hackerNewsArray = [];
  //Get data from hackerNewsAPI
  let hackerNewsData = await getDataFromHackerNewsAPI();
  //get the first 20 items from hackerNewsData
  const twentyItemsData = hackerNewsData.slice(0, 20);
  console.log("Hello", twentyItemsData.length);
  //Go in each story and get score/rank
  //Note : Initally I used forEach loop to iterate through the array but it did not work as it is not async friendly and I was not able to make the function call getDataFromItem() for each array element to get title of the news item so I switched to for of loop as it is infact async friendly
  for (let item of twentyItemsData) {
    // test : console.log("item", item);
    //Get hackerNewsData array in a temporary array variable named 'tempArray'
    let tempArray = hackerNewsArray;
    //Make an API call using 'item' in async function getDataForItem()
    let returnedObject = await getDataForItem(item); // store returned object
    // add object in hackerNewsData using spread syntax
    hackerNewsArray = [...tempArray, returnedObject];
  }
  console.log("hackerNewsArray", hackerNewsArray);
  return hackerNewsArray;
};

/* This async arrow function calls the API to get data using item and returns an object created using that data (score, time, title) received from the API call.*/
const getDataForItem = async (item) => {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${item}.json`
  );
  const data = await response.json();
  //print data on console
  //test : console.log("data title : ", data.title);
  //Create a new object and store title, score, and time in it
  const newObject = { score: data.score, time: data.time, title: data.title };
  return newObject;
};

export default storeNewsFromHacker;
