import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclaps/hardhat-ethers/signers";
import {
  OpinionMarket,
  OpinionCore,
  FeeManager,
  PoolManager,
  PriceCalculator,
  MockERC20
} from "../typechain-types";

// Interface pour stocker les mesures de gaz
interface GasMeasurement {
  operation: string;
  gasUsed: number;
  description: string;
}

describe("OpinionMarket - Gas Optimization", function () {
  // Contracts
  let opinionMarket: OpinionMarket;
  let opinionCore: OpinionCore;
  let feeManager: FeeManager;
  let poolManager: PoolManager;
  let priceCalculator: PriceCalculator;
  let mockUSDC: MockERC20;
  
  // Signers
  let deployer: SignerWithAddress;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let treasury: SignerWithAddress;
  
  // Contract addresses
  let opinionCoreAddress: string;
  let feeManagerAddress: string;
  let poolManagerAddress: string;
  let usdcTokenAddress: string;
  
  // Variables pour les tests
  let opinionId: number;
  let poolId: number;
  
  // Tableau pour stocker les mesures de gaz
  const gasMeasurements: GasMeasurement[] = [];
  
  before(async function () {
    // Augmenter le timeout pour permettre un déploiement complet
    this.timeout(60000);
    
    // Get signers
    [deployer, admin, user1, user2, user3, treasury] = await ethers.getSigners();
    
    // Deploy a mock USDC token
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20Factory.deploy("Mock USDC", "mUSDC");
    usdcTokenAddress = await mockUSDC.getAddress();
    
    // Mint some tokens to users for testing
    const mintAmount = ethers.parseUnits("1000000", 6); // 1M USDC
    await mockUSDC.mint(await user1.getAddress(), mintAmount);
    await mockUSDC.mint(await user2.getAddress(), mintAmount);
    await mockUSDC.mint(await user3.getAddress(), mintAmount);
    await mockUSDC.mint(await treasury.getAddress(), mintAmount);
    
    console.log("Deployed Mock USDC at:", usdcTokenAddress);
    
    // Deploy PriceCalculator library
    const PriceCalculatorFactory = await ethers.getContractFactory("PriceCalculator");
    priceCalculator = await PriceCalculatorFactory.deploy();
    
    // Create libraries object for linking
    const libraries = {
      "contracts/core/libraries/PriceCalculator.sol:PriceCalculator": await priceCalculator.getAddress()
    };
    
    // Deploy core contracts
    console.log("Deploying component contracts...");
    const OpinionCoreFactory = await ethers.getContractFactory("OpinionCore", { libraries });
    const FeeManagerFactory = await ethers.getContractFactory("FeeManager");
    const PoolManagerFactory = await ethers.getContractFactory("PoolManager");
    
    // Deploy contracts with gas reporting
    opinionCore = await upgrades.deployProxy(
      OpinionCoreFactory, 
      [usdcTokenAddress, await admin.getAddress(), await admin.getAddress()],
      { unsafeAllowLinkedLibraries: true }
    ) as OpinionCore;
    
    feeManager = await upgrades.deployProxy(
      FeeManagerFactory,
      [usdcTokenAddress]
    ) as FeeManager;
    
    poolManager = await upgrades.deployProxy(
      PoolManagerFactory,
      [await opinionCore.getAddress(), await feeManager.getAddress(), usdcTokenAddress, await admin.getAddress()]
    ) as PoolManager;
    
    opinionCoreAddress = await opinionCore.getAddress();
    feeManagerAddress = await feeManager.getAddress();
    poolManagerAddress = await poolManager.getAddress();
    
    console.log("Deployed component contracts:");
    console.log("- OpinionCore:", opinionCoreAddress);
    console.log("- FeeManager:", feeManagerAddress);
    console.log("- PoolManager:", poolManagerAddress);
    
    // Setup cross-contract references
    await opinionCore.setFeeManager(feeManagerAddress);
    await opinionCore.setPoolManager(poolManagerAddress);
    await opinionCore.grantRole(await opinionCore.POOL_MANAGER_ROLE(), poolManagerAddress);
    
    await feeManager.grantCoreContractRole(opinionCoreAddress);
    await feeManager.grantCoreContractRole(poolManagerAddress);
    
    // Deploy the main contract
    const OpinionMarketFactory = await ethers.getContractFactory("OpinionMarket");
    
    opinionMarket = await upgrades.deployProxy(
      OpinionMarketFactory,
      [
        usdcTokenAddress,
        opinionCoreAddress,
        feeManagerAddress,
        poolManagerAddress
      ],
      { kind: "uups" }
    ) as OpinionMarket;
    
    console.log("Deployed OpinionMarket at:", await opinionMarket.getAddress());
    
    // Grant roles
    await opinionCore.grantRole(await opinionCore.ADMIN_ROLE(), await admin.getAddress());
    await opinionMarket.grantRole(await opinionMarket.OPERATOR_ROLE(), await admin.getAddress());
    await opinionCore.grantRole(await opinionCore.MARKET_CONTRACT_ROLE(), await opinionMarket.getAddress());
    
    // Enable public creation of opinions
    try {
      await opinionCore.togglePublicCreation();
      console.log("Public creation enabled for gas testing");
    } catch (error) {
      console.log("Failed to enable public creation:", error.message);
    }
    
    // Approve USDC for users
    const approvalAmount = ethers.parseUnits("1000000", 6); // 1M USDC
    await mockUSDC.connect(user1).approve(opinionCoreAddress, approvalAmount);
    await mockUSDC.connect(user2).approve(opinionCoreAddress, approvalAmount);
    await mockUSDC.connect(user3).approve(opinionCoreAddress, approvalAmount);
    await mockUSDC.connect(user1).approve(poolManagerAddress, approvalAmount);
    await mockUSDC.connect(user2).approve(poolManagerAddress, approvalAmount);
    await mockUSDC.connect(user3).approve(poolManagerAddress, approvalAmount);
    await mockUSDC.connect(user1).approve(await opinionMarket.getAddress(), approvalAmount);
    await mockUSDC.connect(user2).approve(await opinionMarket.getAddress(), approvalAmount);
    await mockUSDC.connect(user3).approve(await opinionMarket.getAddress(), approvalAmount);
    
    console.log("USDC approved for gas testing operations");
  });
  
  // Fonction utilitaire pour mesurer le gaz
  async function measureGas(
    txPromise: Promise<any>,
    operationName: string,
    description: string
  ): Promise<any> { // Modifié pour retourner la transaction complète
    const tx = await txPromise;
    const receipt = await tx.wait();
    const gasUsed = Number(receipt.gasUsed);
    
    // Enregistrer la mesure
    gasMeasurements.push({
      operation: operationName,
      gasUsed: gasUsed,
      description: description
    });
    
    console.log(`Gas used for ${operationName}: ${gasUsed}`);
    return receipt; // Retourne le reçu complet
  }
  
  // Fonction pour créer une opinion et retourner son ID
  async function createOpinionAndGetId(user: SignerWithAddress, question: string, answer: string): Promise<number> {
    const tx = await opinionCore.connect(user).createOpinion(question, answer);
    const receipt = await tx.wait();
    
    // Extraire l'ID de l'opinion
    let id;
    for (const event of receipt.logs) {
      try {
        const parsedLog = opinionCore.interface.parseLog({
          topics: [...event.topics], 
          data: event.data
        });
        
        if (parsedLog && parsedLog.name === "OpinionAction") {
          id = parsedLog.args.opinionId;
          break;
        }
      } catch (e) {
        // Not the event we're looking for
      }
    }
    
    if (!id) {
      throw new Error("Failed to get opinion ID");
    }
    
    return id;
  }
  
  describe("Basic Operation Gas Measurements", function () {
    it("Should measure gas for opinion creation", async function () {
      // CORRECTION: Respecter les limites de caractères (50 pour la question, 40 pour la réponse)
      
      // Mesurer le gaz pour une opinion simple
      const gasSimple = await measureGas(
        opinionCore.connect(user1).createOpinion("Simple question?", "Simple answer"),
        "Opinion Creation (Simple)",
        "Basic opinion with short question and answer"
      );
      
      // Mesurer le gaz pour une opinion avec texte plus long (mais dans les limites)
      const gasLong = await measureGas(
        opinionCore.connect(user1).createOpinion(
          "This is a longer question to test gas usage?", 
          "This is also a longer answer to test gas"
        ),
        "Opinion Creation (Long text)",
        "Opinion with longer question and answer"
      );
      
      // Mesurer le gaz pour une opinion avec extras
      const gasExtras = await measureGas(
        opinionCore.connect(user1).createOpinionWithExtras(
          "Question with extras?", 
          "Answer with extras",
          "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX",
          "https://example.com/link"
        ),
        "Opinion Creation (With extras)",
        "Opinion with IPFS hash and external link"
      );
      
      // Comparer et analyser
      console.log(`Gas difference (Long vs Simple): ${Number(gasLong.gasUsed) - Number(gasSimple.gasUsed)}`);
      console.log(`Gas difference (Extras vs Simple): ${Number(gasExtras.gasUsed) - Number(gasSimple.gasUsed)}`);
      
      // Vérifier que les mesures sont raisonnables
      expect(Number(gasSimple.gasUsed)).to.be.lessThan(500000, "Simple opinion creation should use less than 500k gas");
      expect(Number(gasLong.gasUsed)).to.be.greaterThan(Number(gasSimple.gasUsed), "Longer text should use more gas");
      expect(Number(gasExtras.gasUsed)).to.be.greaterThan(Number(gasSimple.gasUsed), "Extras should use more gas");
    });
    
    it("Should measure gas for answer submission", async function () {
      // Créer une opinion pour les tests
      opinionId = await createOpinionAndGetId(user1, "Gas test question?", "Initial answer");
      
      // CORRECTION: Respecter les limites de caractères (40 pour la réponse)
      
      // Mesurer le gaz pour la première réponse
      const gasFirstAnswer = await measureGas(
        opinionCore.connect(user2).submitAnswer(opinionId, "First answer"),
        "Answer Submission (First)",
        "First answer to an opinion"
      );
      
      // Attendre un bloc pour éviter l'erreur SameOwner
      await ethers.provider.send("evm_mine", []);
      
      // Mesurer le gaz pour la deuxième réponse (un autre utilisateur)
      const gasSecondAnswer = await measureGas(
        opinionCore.connect(user3).submitAnswer(opinionId, "Second answer"),
        "Answer Submission (Second)",
        "Second answer to an opinion"
      );
      
      // Attendre un bloc
      await ethers.provider.send("evm_mine", []);
      
      // Mesurer le gaz pour une réponse avec texte plus long (mais dans les limites)
      const gasLongAnswer = await measureGas(
        opinionCore.connect(user1).submitAnswer(opinionId, "This is a longer answer but within limits"),
        "Answer Submission (Long)",
        "Answer with longer text"
      );
      
      // Comparer et analyser
      console.log(`Gas difference (Second vs First): ${Number(gasSecondAnswer.gasUsed) - Number(gasFirstAnswer.gasUsed)}`);
      console.log(`Gas difference (Long vs First): ${Number(gasLongAnswer.gasUsed) - Number(gasFirstAnswer.gasUsed)}`);
      
      // Vérifier que les mesures sont raisonnables
      expect(Number(gasFirstAnswer.gasUsed)).to.be.lessThan(400000, "Answer submission should use less than 400k gas");
      expect(Number(gasLongAnswer.gasUsed)).to.be.greaterThan(Number(gasFirstAnswer.gasUsed), "Longer answer should use more gas");
    });
  });
  
  describe("Pool Operations Gas Measurements", function () {
    // Dans le test - fonction de test optimisée
    it("Should measure gas for pool creation and contribution", async function() {
        // Créer une opinion pour les tests de pool
        opinionId = await createOpinionAndGetId(user1, "Pool gas test - expensive?", "Initial answer");
        
        console.log("Submitting multiple answers to increase opinion price...");
        
        // Utiliser des utilisateurs différents à chaque soumission
        const users = [user2, user3, user1]; // Alternance d'utilisateurs
        for(let i = 0; i < 3; i++) {
          // Soumettre la réponse avec un utilisateur différent du propriétaire actuel
          await opinionCore.connect(users[i]).submitAnswer(opinionId, `Answer ${i+1}`);
          await ethers.provider.send("evm_mine", []); // Nouveau bloc
        }
        
        // Obtenir le prix cible
        const nextPrice = await opinionCore.getNextPrice(opinionId);
        console.log(`Current next price for opinion: ${nextPrice}`);
        
        // Définir contribution initiale
        const initialContribution = BigInt(nextPrice) / BigInt(2); // 50% du prix cible
        console.log(`Setting initial contribution to: ${initialContribution}`);
        
        // Suite du test identique...
        const now = Math.floor(Date.now() / 1000);
        const deadline = now + 7 * 24 * 60 * 60; // 7 jours
        
        const receipt = await measureGas(
          poolManager.connect(user2).createPool(
            opinionId,
            "Pool proposed answer",
            deadline,
            initialContribution,
            "Gas Test Pool",
            "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
          ),
          "Pool Creation",
          "Creating a new pool with initial contribution"
        );
        
        // Obtenir l'ID du pool (même code qu'avant)
        let poolId;
        for (const event of receipt.logs) {
          try {
            const parsedLog = poolManager.interface.parseLog({
              topics: [...event.topics], 
              data: event.data
            });
            
            if (parsedLog && (parsedLog.name === "PoolCreated" || parsedLog.name === "PoolAction")) {
              poolId = parsedLog.args.poolId;
              console.log("Found pool ID:", poolId);
              break;
            }
          } catch (e) {
            // Ignorer les erreurs de parsing
          }
        }
        
        if (typeof poolId === 'undefined' || poolId === null) {
          // Stratégie alternative
          const pools = await poolManager.getOpinionPools(opinionId);
          if (pools && pools.length > 0) {
            poolId = pools[0];
            console.log("Found pool ID from getOpinionPools:", poolId);
          }
        }
        
        if (typeof poolId === 'undefined' || poolId === null) {
          throw new Error("Pool ID not found");
        }
        
        // ÉTAPE 5: Vérifier si le pool peut accepter des contributions
        const poolDetails = await poolManager.getPoolDetails(poolId);
        const targetPrice = poolDetails[1];
        const currentAmount = poolDetails[0].totalAmount;
        const remainingAmount = BigInt(targetPrice) - BigInt(currentAmount);
        
        console.log("Pool details - Target:", targetPrice.toString(), 
                    "Current:", currentAmount.toString(),
                    "Remaining:", remainingAmount.toString());
        
        // Si le pool ne peut pas accepter de contributions, skip le test
        if (remainingAmount <= 0) {
          console.log("Pool already fully funded, skipping contribution test");
          this.skip(); // Marquer explicitement le test comme "skipped"
          return;
        }
        
        // Calculer un montant de contribution valide
        const contributionAmount = remainingAmount > BigInt(10_000_000) ? 
          BigInt(10_000_000) : // Maximum 10 USDC
          remainingAmount / BigInt(2); // Moitié du montant restant
        
        console.log("Contributing amount:", contributionAmount.toString());
        
        // Mesurer le gaz pour une contribution au pool
        await measureGas(
          poolManager.connect(user3).contributeToPool(poolId, contributionAmount),
          "Pool Contribution",
          "Contributing to an existing pool"
        );
      });
  });
  
  describe("Fee Management Gas Measurements", function () {
    it("Should measure gas for fee distribution and claiming", async function () {
      // Vérifier s'il y a des frais accumulés pour user1
      const user1Fees = await feeManager.getAccumulatedFees(await user1.getAddress());
      console.log("User1 accumulated fees:", user1Fees);
      
      if (user1Fees.toString() === "0") {
        console.log("No fees to claim, skipping fee claiming test");
        return;
      }
      
      // Transférer des USDC au FeeManager pour permettre la réclamation
      await mockUSDC.mint(feeManagerAddress, user1Fees);
      
      // Mesurer le gaz pour la réclamation des frais
      await measureGas(
        feeManager.connect(user1).claimAccumulatedFees(),
        "Fee Claiming",
        "Claiming accumulated fees"
      );
    });
  });
  
  describe("Contract Administration Gas Measurements", function () {
    it("Should measure gas for admin operations", async function () {
      // Mesurer le gaz pour la pause du contrat
      await measureGas(
        opinionMarket.connect(admin).pause(),
        "Contract Pause",
        "Pausing the contract"
      );
      
      // Mesurer le gaz pour la reprise du contrat
      await measureGas(
        opinionMarket.connect(admin).unpause(),
        "Contract Unpause",
        "Unpausing the contract"
      );
      
      // Mesurer le gaz pour le changement de prix minimum
      await measureGas(
        opinionCore.connect(admin).setMinimumPrice(ethers.parseUnits("2", 6)),
        "Set Minimum Price",
        "Changing the minimum price parameter"
      );
      
      // Remettre le prix minimum à 1 USDC
      await opinionCore.connect(admin).setMinimumPrice(ethers.parseUnits("1", 6));
    });
  });
  
  describe("Storage Efficiency Tests", function () {
    it("Should analyze opinion storage efficiency", async function () {
      // Créer plusieurs opinions avec des caractéristiques variables
      // CORRECTION: Respecter les limites de caractères
      
      // 1. Opinion très courte
      const gasShort = await measureGas(
        opinionCore.connect(user1).createOpinion("A?", "B"),
        "Opinion Storage (Minimal)",
        "Opinion with minimal text"
      );
      
      // 2. Opinion de longueur moyenne
      const gasMedium = await measureGas(
        opinionCore.connect(user1).createOpinion(
          "Is this a medium length question?", 
          "This is a medium length answer"
        ),
        "Opinion Storage (Medium)",
        "Opinion with medium length text"
      );
      
      // 3. Opinion à la longueur maximale (sans dépasser les limites)
      const maxQuestionLength = 50;
      const maxAnswerLength = 40;
      const gasMaximum = await measureGas(
        opinionCore.connect(user1).createOpinion(
          "Q".repeat(maxQuestionLength - 1), // Maximum length - 1 pour être sûr
          "A".repeat(maxAnswerLength - 1)    // Maximum length - 1 pour être sûr
        ),
        "Opinion Storage (Maximum)",
        "Opinion with maximum length text"
      );
      
      // Analyser la différence de coût de stockage
      const totalCharsMax = (maxQuestionLength - 1) + (maxAnswerLength - 1);
      const totalCharsMin = 1 + 1; // "A?" + "B"
      const gasPerCharQ = (Number(gasMaximum.gasUsed) - Number(gasShort.gasUsed)) / (totalCharsMax - totalCharsMin);
      console.log(`Estimated gas per character: ${gasPerCharQ.toFixed(2)}`);
      
      // Calculer l'efficacité du stockage des chaînes
      console.log(`Gas difference per char (Max vs Min): ${((Number(gasMaximum.gasUsed) - Number(gasShort.gasUsed)) / (totalCharsMax - totalCharsMin)).toFixed(2)}`);
      
      const totalCharsMed = "Is this a medium length question?".length + "This is a medium length answer".length;
      console.log(`Gas difference per char (Med vs Min): ${((Number(gasMedium.gasUsed) - Number(gasShort.gasUsed)) / (totalCharsMed - totalCharsMin)).toFixed(2)}`);
    });
  });
  
  // Fonction pour afficher un rapport de gaz à la fin des tests
  after(function() {
    console.log("\n=== GAS USAGE REPORT ===");
    console.log("Operation                         | Gas Used  | % of Limit | Description");
    console.log("----------------------------------|-----------|------------|------------");
    
    // Trier par consommation de gaz (du plus élevé au plus bas)
    gasMeasurements.sort((a, b) => b.gasUsed - a.gasUsed);
    
    // Calculer le pourcentage de la limite de gaz (15M)
    const gasLimit = 15000000;
    
    for (const measurement of gasMeasurements) {
      const percentOfLimit = ((measurement.gasUsed / gasLimit) * 100).toFixed(2);
      console.log(
        `${measurement.operation.padEnd(32)} | ${measurement.gasUsed.toString().padEnd(9)} | ${percentOfLimit.padEnd(10)}% | ${measurement.description}`
      );
    }
    
    console.log("\n=== OPTIMIZATION RECOMMENDATIONS ===");
    
    // Identifier les opérations coûteuses (>100k gaz)
    const costlyOps = gasMeasurements.filter(m => m.gasUsed > 100000);
    if (costlyOps.length > 0) {
      console.log("High-cost operations that should be prioritized for optimization:");
      for (const op of costlyOps) {
        console.log(`- ${op.operation}: ${op.gasUsed} gas`);
      }
    } else {
      console.log("No particularly high-cost operations identified.");
    }
    
    // Identifier les opérations à haute fréquence
    console.log("\nFrequently used operations to consider for optimization:");
    console.log("- Opinion creation: Optimize storage patterns");
    console.log("- Answer submission: Consider batching price calculations");
    console.log("- Fee accumulation: Use efficient storage updates");
    
    console.log("\n=== STORAGE OPTIMIZATION TIPS ===");
    console.log("1. Pack related values into storage slots (uint128, uint96, etc.)");
    console.log("2. Use bytes32 instead of string where possible");
    console.log("3. Consider using mapping instead of arrays for lookups");
    console.log("4. Cache storage variables in memory when used multiple times");
    console.log("5. Delete storage variables when no longer needed to reclaim gas");
  });
});