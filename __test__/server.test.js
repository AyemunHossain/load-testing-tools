import axios from "axios";
import pLimit from "p-limit";
import { simulate, runConcurrentRequests } from "../script"; // Update the path based on your project structure
import schema from "../utils";

jest.mock("axios"); // Mock axios to prevent actual API calls

describe("User Input Validation", () => {
  it("should validate correct user input", () => {
    const validInput = {
      API_URL: "https://example.com",
      TOTAL_USERS: 10,
      CONCURRENCY_LIMIT: 5,
      REQUEST_TYPE: "GET",
    };

    const { error } = schema.validate(validInput);
    expect(error).toBeUndefined();
  });

  it("should fail for invalid user input", () => {
    const invalidInput = {
      API_URL: "",
      TOTAL_USERS: -5,
      CONCURRENCY_LIMIT: "abc",
      REQUEST_TYPE: "INVALID",
    };

    const { error } = schema.validate(invalidInput);
    expect(error).toBeDefined();
  });
});

describe("API Request Simulation", () => {
  const config = {
    API_URL: "https://example.com",
    REQUEST_TYPE: "GET",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle a successful GET request", async () => {
    axios.get.mockResolvedValue({ data: { success: true } });

    const result = await simulate(1, config);
    expect(result).toEqual({ reqId: 1, success: true, data: { success: true } });
    expect(axios.get).toHaveBeenCalledWith("https://example.com", { headers: {} });
  });

  it("should handle a failed GET request", async () => {
    axios.get.mockRejectedValue(new Error("Request failed"));

    const result = await simulate(1, config);
    expect(result).toEqual({ reqId: 1, success: false, error: "Request failed" });
  });

  it("should handle a successful POST request", async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    const result = await simulate(2, { ...config, REQUEST_TYPE: "POST" });
    expect(result).toEqual({ reqId: 2, success: true, data: { success: true } });
    expect(axios.post).toHaveBeenCalled();
  });
});

describe("Concurrent Requests", () => {
  it("should process multiple user requests concurrently", async () => {
    const mockConfig = {
      TOTAL_USERS: 5,
      CONCURRENCY_LIMIT: 2,
      API_URL: "https://example.com",
      REQUEST_TYPE: "GET",
    };

    axios.get.mockResolvedValue({ data: { success: true } });

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await runConcurrentRequests(mockConfig);
    consoleSpy.mockRestore();

    expect(axios.get).toHaveBeenCalledTimes(5);
  });
});
