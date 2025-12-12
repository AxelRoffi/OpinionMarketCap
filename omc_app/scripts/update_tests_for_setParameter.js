#!/usr/bin/env node

/**
 * Script to update all test files to use setParameter() instead of individual setters
 * 
 * Parameter type mapping:
 * 0 = minimumPrice
 * 3 = absoluteMaxPriceChange (maxPriceChange)
 * 4 = maxTradesPerBlock
 * 6 = questionCreationFee
 * 7 = initialAnswerPrice
 * 8 = maxQuestionLength
 * 9 = maxAnswerLength
 * 10 = maxLinkLength
 * 11 = maxIpfsHashLength
 * 12 = maxDescriptionLength
 * 13 = maxCategoriesPerOpinion
 * 14 = creationFeePercent
 */

const fs = require('fs');
const path = require('path');

// Mapping of old function names to parameter types
const SETTER_MAPPINGS = {
    'setMinimumPrice': 0,
    'setMaxPriceChange': 3,
    'setMaxTradesPerBlock': 4,
    'setQuestionCreationFee': 6,
    'setInitialAnswerPrice': 7,
    'setMaxQuestionLength': 8,
    'setMaxAnswerLength': 9,
    'setMaxLinkLength': 10,
    'setMaxIpfsHashLength': 11,
    'setMaxDescriptionLength': 12,
    'setMaxCategoriesPerOpinion': 13,
    'setCreationFeePercent': 14
};

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace each setter function call
    for (const [oldFunc, paramType] of Object.entries(SETTER_MAPPINGS)) {
        // Pattern: .setMinimumPrice(value) -> .setParameter(0, value)
        const regex = new RegExp(`\\.${oldFunc}\\(([^)]+)\\)`, 'g');

        if (regex.test(content)) {
            content = content.replace(regex, `.setParameter(${paramType}, $1)`);
            modified = true;
            console.log(`  ✓ Updated ${oldFunc} -> setParameter(${paramType}, ...) in ${path.basename(filePath)}`);
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    let totalUpdated = 0;

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            totalUpdated += processDirectory(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            if (updateFile(filePath)) {
                totalUpdated++;
            }
        }
    }

    return totalUpdated;
}

// Main execution
const testDir = path.join(__dirname, '..', 'test');
console.log('🔄 Updating test files to use setParameter()...\n');

const updatedCount = processDirectory(testDir);

console.log(`\n✅ Updated ${updatedCount} test file(s)`);
console.log('\n📝 Parameter type reference:');
for (const [func, type] of Object.entries(SETTER_MAPPINGS)) {
    console.log(`   ${type}: ${func}`);
}
