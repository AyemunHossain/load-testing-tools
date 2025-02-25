import axios from "axios";
import pLimit from "p-limit";
import readline from "readline/promises";
import Joi from "joi";
import schema from "./utils.js";

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var API_URL = "";
var TOTAL_USERS = 0;
var CONCURRENCY_LIMIT = 0;
var YOUR_JWT_TOKEN_HERE = "";
var REQUEST_TYPE = "";
const HEADERS = {}; // Store headers dynamically


const getUserHeaders = async () => {
    while (true) {
        console.log("Enter headers in key:value format (e.g., name:ashik, age:12). Press Enter when done.");
        const headerInput = await rl.question("Header (key:value) or Enter to skip: ");
        
        if (!headerInput) break;
      
        const headerArray = headerInput.split(",").map((item) => item.trim());
        for (const item of headerArray) {
          const [key, value] = item.split(":").map((str) => str.trim());
          
          if (!key || !value) {
            console.log("❌ Invalid header format. Use key:value (e.g., name:ashik).");
            continue;
          }
      
          HEADERS[key] = value;
        }
      }

  rl.close();
      
}
// Function to get user input with validation
const getUserInput = async () => {

  while (true) {
    API_URL = await rl.question("Enter the URL: ");
    if (!API_URL) {
      console.log("❌ URL cannot be empty. Please enter a valid URL.");
      continue;
    }

    REQUEST_TYPE = await rl.question("Request Type (GET, POST, PUT, DELETE): ");
    if (!REQUEST_TYPE) {
      console.log(
        "❌ Request Type cannot be empty. Please enter a valid request type."
      );
      continue;
    }

    TOTAL_USERS = await rl.question("Total Users: ");
    if (!TOTAL_USERS) {
      console.log(
        "❌ Total Users cannot be empty. Please enter a valid number."
      );
      continue;
    }

    CONCURRENCY_LIMIT = await rl.question("Concurrency Limit: ");
    if (!CONCURRENCY_LIMIT) {
      console.log(
        "❌ Concurrency Limit cannot be empty. Please enter a valid number."
      );
      continue;
    }

    // Validate user input
    const { error, value } = schema.validate({
      API_URL,
      TOTAL_USERS,
      CONCURRENCY_LIMIT,
      REQUEST_TYPE,
    });

    if (error) {
      console.log(error.details.map((err) => err.message).join("\n"));
      continue; // Ask for inputs again
    }

    // Assign validated values
    API_URL = value.API_URL;
    TOTAL_USERS = value.TOTAL_USERS;
    CONCURRENCY_LIMIT = value.CONCURRENCY_LIMIT;
    REQUEST_TYPE = value.REQUEST_TYPE;
    break; // Exit loop when inputs are valid
  }

  return { API_URL, TOTAL_USERS, CONCURRENCY_LIMIT, REQUEST_TYPE };
};

// Function to simulate a single user request
const simulate = async (reqId, config) => {
    const { API_URL, REQUEST_TYPE } = config;
    const headers = HEADERS;
  
    try {
      let response;
      const requestData = { id: 107, ticket_id: 1, user_id: reqId };
  
      switch (REQUEST_TYPE) {
        case "GET":
          response = await axios.get(API_URL, { headers });
          break;
        case "POST":
          response = await axios.post(API_URL, requestData, { headers });
          break;
        case "PUT":
          response = await axios.put(API_URL, requestData, { headers });
          break;
        case "DELETE":
          response = await axios.delete(API_URL, { headers, data: requestData });
          break;
        default:
          throw new Error("Invalid request type.");
      }
  
      return { reqId, success: true, data: response.data };
    } catch (error) {
      console.error(`Request ${reqId} failed: ${error.message}`);
      return { reqId, success: false, error: error.message };
    }
  };
  
  // Main function to run concurrent requests
  const runConcurrentRequests = async (config) => {
    const { TOTAL_USERS, CONCURRENCY_LIMIT } = config;
    const limit = pLimit(CONCURRENCY_LIMIT);
  
    const userRequests = Array.from({ length: TOTAL_USERS }, (_, i) => {
      return limit(() => simulate(i + 1, config));
    });
  
    console.log(`Simulating ${TOTAL_USERS} user requests with a concurrency limit of ${CONCURRENCY_LIMIT}...`);
  
    const results = await Promise.all(userRequests);
  
    // Summary
    const successfulRequests = results.filter((result) => result.success).length;
    const failedRequests = results.length - successfulRequests;
  
    console.log("Test Results:");
    console.log(`Total Requests: ${TOTAL_USERS}`);
    console.log(`Successful Requests: ${successfulRequests}`);
    console.log(`Failed Requests: ${failedRequests}`);
  };
  
  // Run the script in order
  (async () => {
    const config = await getUserInput();
    await getUserHeaders();
    await runConcurrentRequests(config);
    console.log("Testing completed successfully");
  })();
  