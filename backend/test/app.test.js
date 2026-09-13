const test = require("node:test");
const assert = require("node:assert/strict");
const createApp = require("../src/app");

const startTestServer = async () => {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const listeningServer = app.listen(0, () => resolve(listeningServer));
  });

  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    }),
  };
};

test("root endpoint describes the api", async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.service, "Farmy Crop Procurement API");
  } finally {
    await server.close();
  }
});

test("api requests return a clear database-unavailable response when disconnected", async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobileNumber: "9876543210",
        password: "password",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.success, false);
    assert.match(body.error, /Database is unavailable/);
  } finally {
    await server.close();
  }
});
