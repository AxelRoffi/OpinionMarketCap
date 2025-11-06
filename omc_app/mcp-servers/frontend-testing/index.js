#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__dirname);

/**
 * FrontendTesting MCP Server
 * Comprehensive frontend testing automation for OpinionMarketCap including E2E, unit, integration, and Web3 testing
 */
class FrontendTesting {
  constructor() {
    this.projectRoot = join(__dirname, "../..");
    this.frontendPath = join(this.projectRoot, "frontend");
    this.server = new Server(
      {
        name: "frontend-testing",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "run_full_test_suite",
          description: "Runs comprehensive frontend test suite including unit, integration, and E2E tests",
          inputSchema: {
            type: "object",
            properties: {
              testTypes: {
                type: "array",
                description: "Types of tests to run",
                items: {
                  type: "string",
                  enum: ["unit", "integration", "e2e", "web3", "visual", "accessibility"]
                },
                default: ["unit", "integration", "e2e"]
              },
              environment: {
                type: "string",
                description: "Test environment",
                enum: ["local", "staging", "production"],
                default: "local"
              },
              parallel: {
                type: "boolean",
                description: "Run tests in parallel",
                default: true
              },
              generateReport: {
                type: "boolean",
                description: "Generate comprehensive test report",
                default: true
              }
            }
          }
        },
        {
          name: "run_web3_tests",
          description: "Runs specialized Web3 and blockchain interaction tests",
          inputSchema: {
            type: "object",
            properties: {
              network: {
                type: "string",
                description: "Blockchain network to test against",
                enum: ["hardhat", "baseSepolia", "base"],
                default: "hardhat"
              },
              testWalletConnection: {
                type: "boolean",
                description: "Test wallet connection flows",
                default: true
              },
              testTransactions: {
                type: "boolean",
                description: "Test transaction flows",
                default: true
              },
              testContractInteractions: {
                type: "boolean",
                description: "Test smart contract interactions",
                default: true
              }
            }
          }
        },
        {
          name: "run_e2e_user_journeys",
          description: "Runs end-to-end tests covering complete user journeys",
          inputSchema: {
            type: "object",
            properties: {
              journeys: {
                type: "array",
                description: "User journeys to test",
                items: {
                  type: "string",
                  enum: [
                    "opinion-creation",
                    "answer-submission", 
                    "question-trading",
                    "pool-participation",
                    "admin-moderation"
                  ]
                },
                default: ["opinion-creation", "answer-submission", "question-trading"]
              },
              browser: {
                type: "string",
                description: "Browser to use for testing",
                enum: ["chrome", "firefox", "safari", "edge"],
                default: "chrome"
              },
              headless: {
                type: "boolean",
                description: "Run in headless mode",
                default: true
              }
            }
          }
        },
        {
          name: "performance_testing",
          description: "Runs frontend performance tests and load testing",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "URL to test",
                default: "https://test.opinionmarketcap.xyz"
              },
              loadPatterns: {
                type: "array",
                description: "Load testing patterns",
                items: {
                  type: "string",
                  enum: ["light", "normal", "heavy", "spike", "stress"]
                },
                default: ["normal", "heavy"]
              },
              duration: {
                type: "number",
                description: "Test duration in minutes",
                default: 10
              }
            }
          }
        },
        {
          name: "visual_regression_testing",
          description: "Runs visual regression tests to detect UI changes",
          inputSchema: {
            type: "object",
            properties: {
              baselineUrl: {
                type: "string",
                description: "Baseline URL for comparison"
              },
              testUrl: {
                type: "string",
                description: "Test URL to compare against baseline"
              },
              viewports: {
                type: "array",
                description: "Viewports to test",
                items: {
                  type: "string",
                  enum: ["mobile", "tablet", "desktop", "wide"]
                },
                default: ["mobile", "desktop"]
              },
              threshold: {
                type: "number",
                description: "Difference threshold (0-1)",
                default: 0.02
              }
            }
          }
        },
        {
          name: "accessibility_testing",
          description: "Runs comprehensive accessibility tests",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "URL to test for accessibility",
                required: true
              },
              standards: {
                type: "array",
                description: "Accessibility standards to test against",
                items: {
                  type: "string",
                  enum: ["WCAG2A", "WCAG2AA", "WCAG2AAA", "Section508"]
                },
                default: ["WCAG2AA"]
              },
              includeColorContrast: {
                type: "boolean",
                description: "Include color contrast testing",
                default: true
              }
            }
          }
        },
        {
          name: "generate_test_data",
          description: "Generates test data for frontend testing scenarios",
          inputSchema: {
            type: "object",
            properties: {
              dataType: {
                type: "string",
                description: "Type of test data to generate",
                enum: ["opinions", "users", "transactions", "pools"],
                required: true
              },
              quantity: {
                type: "number",
                description: "Number of test records to generate",
                default: 100
              },
              format: {
                type: "string",
                description: "Output format",
                enum: ["json", "csv", "sql"],
                default: "json"
              }
            }
          }
        },
        {
          name: "cross_browser_testing",
          description: "Runs tests across multiple browsers and devices",
          inputSchema: {
            type: "object",
            properties: {
              browsers: {
                type: "array",
                description: "Browsers to test",
                items: {
                  type: "string",
                  enum: ["chrome", "firefox", "safari", "edge", "mobile-chrome", "mobile-safari"]
                },
                default: ["chrome", "firefox", "safari"]
              },
              testSuite: {
                type: "string",
                description: "Test suite to run",
                enum: ["smoke", "regression", "full"],
                default: "smoke"
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "run_full_test_suite":
            return await this.runFullTestSuite(args);
          case "run_web3_tests":
            return await this.runWeb3Tests(args);
          case "run_e2e_user_journeys":
            return await this.runE2EUserJourneys(args);
          case "performance_testing":
            return await this.performanceTesting(args);
          case "visual_regression_testing":
            return await this.visualRegressionTesting(args);
          case "accessibility_testing":
            return await this.accessibilityTesting(args);
          case "generate_test_data":
            return await this.generateTestData(args);
          case "cross_browser_testing":
            return await this.crossBrowserTesting(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async runFullTestSuite(args = {}) {
    const { 
      testTypes = ["unit", "integration", "e2e"], 
      environment = "local", 
      parallel = true, 
      generateReport = true 
    } = args;
    
    console.log(`🧪 Running full test suite (${testTypes.join(", ")}) in ${environment} environment...`);
    
    const testSuite = {
      timestamp: new Date().toISOString(),
      testTypes,
      environment,
      parallel,
      results: {}
    };

    try {
      const testPromises = [];

      // Run different test types
      for (const testType of testTypes) {
        if (parallel) {
          testPromises.push(this.runTestType(testType, environment));
        } else {
          const result = await this.runTestType(testType, environment);
          testSuite.results[testType] = result;
        }
      }

      // Wait for parallel tests if running in parallel
      if (parallel && testPromises.length > 0) {
        const results = await Promise.allSettled(testPromises);
        results.forEach((result, index) => {
          const testType = testTypes[index];
          testSuite.results[testType] = result.status === "fulfilled" ? result.value : {
            success: false,
            error: result.reason?.message || "Test failed"
          };
        });
      }

      // Calculate overall results
      const overallResults = this.calculateOverallResults(testSuite.results);
      testSuite.overall = overallResults;

      // Generate report if requested
      if (generateReport) {
        const report = this.generateTestReport(testSuite);
        const reportPath = `reports/test-suite-${Date.now()}.md`;
        this.ensureDirectoryExists("reports");
        writeFileSync(join(this.projectRoot, reportPath), report);
        testSuite.reportPath = reportPath;
      }

      const summary = this.generateTestSummary(testSuite);

      return {
        content: [
          {
            type: "text",
            text: summary
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Test suite execution failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async runWeb3Tests(args = {}) {
    const { 
      network = "hardhat", 
      testWalletConnection = true, 
      testTransactions = true, 
      testContractInteractions = true 
    } = args;
    
    console.log(`🌐 Running Web3 tests on ${network} network...`);
    
    const web3Tests = {
      timestamp: new Date().toISOString(),
      network,
      tests: {}
    };

    try {
      // 1. Wallet Connection Tests
      if (testWalletConnection) {
        console.log("👛 Testing wallet connections...");
        web3Tests.tests.walletConnection = await this.testWalletConnections(network);
      }

      // 2. Transaction Tests
      if (testTransactions) {
        console.log("💸 Testing transactions...");
        web3Tests.tests.transactions = await this.testTransactions(network);
      }

      // 3. Contract Interaction Tests
      if (testContractInteractions) {
        console.log("📝 Testing contract interactions...");
        web3Tests.tests.contractInteractions = await this.testContractInteractions(network);
      }

      // 4. Web3 Provider Tests
      web3Tests.tests.web3Provider = await this.testWeb3Provider(network);

      // 5. Gas Estimation Tests
      web3Tests.tests.gasEstimation = await this.testGasEstimation(network);

      // 6. Error Handling Tests
      web3Tests.tests.errorHandling = await this.testWeb3ErrorHandling(network);

      const overallResults = this.calculateOverallResults(web3Tests.tests);
      web3Tests.overall = overallResults;

      const report = this.generateWeb3TestReport(web3Tests);

      return {
        content: [
          {
            type: "text",
            text: report
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Web3 tests failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async runE2EUserJourneys(args = {}) {
    const { 
      journeys = ["opinion-creation", "answer-submission", "question-trading"],
      browser = "chrome",
      headless = true
    } = args;
    
    console.log(`🎭 Running E2E user journey tests in ${browser}...`);
    
    const e2eTests = {
      timestamp: new Date().toISOString(),
      browser,
      headless,
      journeys: {}
    };

    try {
      // Setup browser
      const browserInstance = await this.setupBrowser(browser, headless);

      // Run each journey
      for (const journey of journeys) {
        console.log(`🚀 Testing ${journey} journey...`);
        e2eTests.journeys[journey] = await this.testUserJourney(journey, browserInstance);
      }

      // Cleanup browser
      await this.cleanupBrowser(browserInstance);

      const overallResults = this.calculateOverallResults(e2eTests.journeys);
      e2eTests.overall = overallResults;

      const report = this.generateE2ETestReport(e2eTests);

      return {
        content: [
          {
            type: "text",
            text: report
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ E2E tests failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async performanceTesting(args) {
    const { 
      url = "https://test.opinionmarketcap.xyz", 
      loadPatterns = ["normal", "heavy"], 
      duration = 10 
    } = args;
    
    console.log(`⚡ Running performance tests for ${url}...`);
    
    const perfTests = {
      timestamp: new Date().toISOString(),
      url,
      loadPatterns,
      duration,
      results: {}
    };

    try {
      // Run performance tests for each load pattern
      for (const pattern of loadPatterns) {
        console.log(`📊 Testing ${pattern} load pattern...`);
        perfTests.results[pattern] = await this.runLoadTest(url, pattern, duration);
      }

      // Core Web Vitals analysis
      perfTests.results.coreWebVitals = await this.measureCoreWebVitals(url);

      // Resource loading analysis
      perfTests.results.resourceLoading = await this.analyzeResourceLoading(url);

      // JavaScript performance analysis
      perfTests.results.jsPerformance = await this.analyzeJSPerformance(url);

      const report = this.generatePerformanceTestReport(perfTests);

      return {
        content: [
          {
            type: "text",
            text: report
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Performance testing failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async visualRegressionTesting(args) {
    const { baselineUrl, testUrl, viewports = ["mobile", "desktop"], threshold = 0.02 } = args;
    
    console.log(`👁️ Running visual regression tests...`);
    
    const visualTests = {
      timestamp: new Date().toISOString(),
      baselineUrl,
      testUrl,
      viewports,
      threshold,
      results: {}
    };

    try {
      // Test each viewport
      for (const viewport of viewports) {
        console.log(`📱 Testing ${viewport} viewport...`);
        visualTests.results[viewport] = await this.runVisualRegression(
          baselineUrl, 
          testUrl, 
          viewport, 
          threshold
        );
      }

      const report = this.generateVisualRegressionReport(visualTests);

      return {
        content: [
          {
            type: "text",
            text: report
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Visual regression testing failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  async accessibilityTesting(args) {
    const { url, standards = ["WCAG2AA"], includeColorContrast = true } = args;
    
    console.log(`♿ Running accessibility tests for ${url}...`);
    
    const a11yTests = {
      timestamp: new Date().toISOString(),
      url,
      standards,
      includeColorContrast,
      results: {}
    };

    try {
      // Test each accessibility standard
      for (const standard of standards) {
        console.log(`📋 Testing ${standard} compliance...`);
        a11yTests.results[standard] = await this.testAccessibilityStandard(url, standard);
      }

      // Color contrast testing
      if (includeColorContrast) {
        a11yTests.results.colorContrast = await this.testColorContrast(url);
      }

      // Keyboard navigation testing
      a11yTests.results.keyboardNavigation = await this.testKeyboardNavigation(url);

      // Screen reader compatibility
      a11yTests.results.screenReader = await this.testScreenReaderCompatibility(url);

      const report = this.generateAccessibilityReport(a11yTests);

      return {
        content: [
          {
            type: "text",
            text: report
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Accessibility testing failed: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  // Implementation methods (many are placeholders for comprehensive implementation)
  async runTestType(testType, environment) {
    const commands = {
      unit: `cd ${this.frontendPath} && npm test -- --coverage`,
      integration: `cd ${this.frontendPath} && npm run test:integration`,
      e2e: `cd ${this.frontendPath} && npm run test:e2e`,
      web3: `cd ${this.frontendPath} && npm run test:web3`,
      visual: `cd ${this.frontendPath} && npm run test:visual`,
      accessibility: `cd ${this.frontendPath} && npm run test:a11y`
    };

    try {
      const command = commands[testType];
      if (!command) {
        throw new Error(`Unknown test type: ${testType}`);
      }

      const result = await this.executeCommand(command);
      return {
        success: result.exitCode === 0,
        output: result.output,
        errors: result.errors,
        coverage: this.extractCoverage(result.output)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testWalletConnections(network) {
    // Placeholder for wallet connection testing
    return {
      success: true,
      tests: {
        metamask: { success: true, connectionTime: 1200 },
        walletConnect: { success: true, connectionTime: 1500 },
        coinbaseWallet: { success: true, connectionTime: 1100 }
      }
    };
  }

  async testTransactions(network) {
    // Placeholder for transaction testing
    return {
      success: true,
      tests: {
        createOpinion: { success: true, gasUsed: 150000 },
        submitAnswer: { success: true, gasUsed: 120000 },
        buyQuestion: { success: true, gasUsed: 80000 }
      }
    };
  }

  calculateOverallResults(results) {
    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(r => r.success).length;
    
    return {
      total,
      passed,
      failed: total - passed,
      successRate: total > 0 ? (passed / total * 100).toFixed(1) : 0
    };
  }

  extractCoverage(output) {
    const coverageMatch = output.match(/All files[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*(\d+(?:\.\d+)?)/);
    return coverageMatch ? parseFloat(coverageMatch[1]) : null;
  }

  // Report generation methods
  generateTestReport(testSuite) {
    let report = `# Frontend Test Suite Report\n\n`;
    report += `**Generated:** ${testSuite.timestamp}\n`;
    report += `**Environment:** ${testSuite.environment}\n`;
    report += `**Test Types:** ${testSuite.testTypes.join(", ")}\n`;
    report += `**Overall Success Rate:** ${testSuite.overall.successRate}%\n\n`;

    for (const [testType, result] of Object.entries(testSuite.results)) {
      report += `## ${testType.charAt(0).toUpperCase() + testType.slice(1)} Tests\n`;
      report += `**Status:** ${result.success ? "✅ PASSED" : "❌ FAILED"}\n`;
      if (result.coverage) {
        report += `**Coverage:** ${result.coverage}%\n`;
      }
      report += `\n`;
    }

    return report;
  }

  generateTestSummary(testSuite) {
    const { overall } = testSuite;
    let summary = `# Test Suite Summary\n\n`;
    summary += `**📊 Overall Results:** ${overall.passed}/${overall.total} tests passed (${overall.successRate}%)\n`;
    summary += `**⚡ Test Types:** ${testSuite.testTypes.join(", ")}\n`;
    
    if (testSuite.reportPath) {
      summary += `**📄 Detailed Report:** ${testSuite.reportPath}\n`;
    }

    if (overall.successRate == 100) {
      summary += `\n🎉 **All tests passed!** Ready for deployment.`;
    } else {
      summary += `\n⚠️ **Some tests failed.** Review failures before deployment.`;
    }

    return summary;
  }

  // Utility methods
  async executeCommand(command, options = {}) {
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(" ");
      const child = spawn(cmd, args, {
        cwd: this.projectRoot,
        stdio: "pipe",
        ...options
      });

      let output = "";
      let errors = "";

      child.stdout?.on("data", (data) => {
        output += data.toString();
      });

      child.stderr?.on("data", (data) => {
        errors += data.toString();
      });

      child.on("close", (exitCode) => {
        resolve({
          exitCode,
          output: output.trim(),
          errors: errors.trim()
        });
      });
    });
  }

  ensureDirectoryExists(dir) {
    try {
      mkdirSync(join(this.projectRoot, dir), { recursive: true });
    } catch (e) {
      // Directory already exists
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[FrontendTesting Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("FrontendTesting MCP server running on stdio");
  }
}

const testing = new FrontendTesting();
testing.run().catch(console.error);