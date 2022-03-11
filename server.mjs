import express from "express";
import cors from "cors";
import dialogflow from "@google-cloud/dialogflow";
import { WebhookClient, Suggestion, Card } from "dialogflow-fulfillment";

const app = express();
app.use(cors()); // enable all cors requests
app.use(express.json()); // to support JSON-encoded bodies
const sessionClient = new dialogflow.SessionsClient(); // create a session client

const PORT = process.env.PORT || 3000;

app.post("/talktochatbot", async (req, res) => {
  const projectId = "japaneserestaurant-fvlt"; // replace with your project ID
  const sessionId = req.body.sessionId || "session123"; // unique identifier for the given session
  const query = req.body.text; // the text query to send to the dialogflow agent
  const languageCode = "en-US"; // the language code of the query

  console.log("query: ", query, req.body, projectId);

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath( 
    projectId,
    sessionId
  );

  // The text query request.
  const request = { // create a request object
    session: sessionPath, 
    queryInput: { 
      text: { 
        text: query,
        languageCode: languageCode,
      },
    },
  };
  console.log("request: ", request);

  try {
    const responses = await sessionClient.detectIntent(request);
     console.log("responses: ", responses);
     console.log("resp: ", responses[0].queryResult.fulfillmentText); 
    res.send({
      text: responses[0].queryResult.fulfillmentText, // here we are getting fulfillment text from dialogflow
    });
  } catch (e) {
    console.log("error while detecting intent: ", e);
  }
});

// will use below when using dialoflow-fulfillment library, it is preferred over writing json by hand because it will 
//automatically generate the json for you in every other platforms like facebook, whatsapp etc.
// the library will automatically convert the request body into a json object for all types of messages and send it to the dialogflow agent
app.post("/webhook", (req, res) => {

    const agent = new WebhookClient({ request: req, response: res });
    console.log("agent: ", agent);
    console.log("agent.request: ", agent.request);
    console.log("agent.response: ", agent.response);
    
    function welcome(agent) {
        agent.add(`Welcome to the Japanese Restaurant`);
        agent.add(`What do you want to order? `);
        agent.add(new Suggestion(`Sushi`));
        agent.add(new Card(`https://www.istockphoto.com/photo/all-you-can-eat-sushi-gm1053854126-281575595`));
        agent.add(new Suggestion(`Udon`));
        agent.add(new Card(`https://www.istockphoto.com/photo/all-you-can-eat-sushi-gm1053854126-281575595`));
        agent.add(new Suggestion(`Menu List`));
        agent.add(new Card(`https://www.istockphoto.com/photo/all-you-can-eat-sushi-gm1053854126-281575595`));
    }

    let menulist = (agent) => { 
      

      // fetch weather data from the API

      agent.add(`The weather in ${cityname} is windy having 19 degree celsius`);	

    }
    
    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }
    
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("menuList", menulist);
    intentMap.set("Default Fallback Intent", fallback);
    agent.handleRequest(intentMap);

});


// below method is used when we are not using dialogflow-fulfillment library
// app.post("/webhook", (req, res) => {

//     const params = req.body.queryResult.parameters; // get the parameters from the request

//     console.log("params.cityName: ", params.cityName)

//     // TODO: make api call to weather server

//     res.send({ 
//         "fulfillmentText": `response from webhook. weather of ${params.cityName} is 17°C. 
//                             thank you for calling weather app. good bye.`,


//         "fulfillmentMessages": [ 
//             {
//                 "text": {
//                     "text": [
//                         `response from webhoook weather of ${params.cityName} is 17°C.
//                         thank you for calling weather app. good bye.`
//                     ]
//                 }
//             }
//         ]
//     })
// })
// the above json sending method is too lengthy and hectic, as we have to write json for images, cards , carousal cards etc etc
//for this we will use dialogflow-fulfillment library so it will make json for 

// fulfillmentMessages, fulfillmentText, source, payload, followupEventInput and there lots of other types we can send messages to dialogflow
// different for different platforms like facebook, whatsapp, google assistant etc.
// fulfilment text is used for single text
// fulfillment messages is used for multiple text messages

// https://developers.google.com/actions/reference/rest/Shared.Types/AppResponse#WebhookResponse



app.get("/profile", (req, res) => {
  res.send("here is your profile");
});
app.get("/about", (req, res) => {
  res.send("some information about me");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
