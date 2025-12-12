const { DEPLOYMENT_CONFIG, validateConfig } = require("./mainnet-deploy-config");

console.log("🧪 Testing Deployment Config");
console.log("Treasury:", DEPLOYMENT_CONFIG.roles.treasury);
console.log("Admin:", DEPLOYMENT_CONFIG.roles.admin);

try {
  validateConfig();
  console.log("✅ Config validation passed");
} catch (error) {
  console.error("❌ Config validation failed:", error.message);
}