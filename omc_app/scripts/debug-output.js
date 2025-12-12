console.log("🔍 Debug Test - This should show immediately");
console.log("Current time:", new Date().toISOString());
console.log("Process:", process.version);

async function test() {
  console.log("✅ Async function started");
  return "success";
}

test().then(result => {
  console.log("✅ Async completed:", result);
}).catch(error => {
  console.error("❌ Error:", error);
});