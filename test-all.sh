#!/bin/bash

# Every Haiku Test Runner Script
# This script runs all tests for the Every Haiku application

set -e  # Exit on error

echo "========================================="
echo "Every Haiku - Comprehensive Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase emulators are installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI not found. Please install it with: npm install -g firebase-tools${NC}"
    exit 1
fi

# Function to run tests with colored output
run_test_suite() {
    local suite_name=$1
    local command=$2
    
    echo -e "${YELLOW}Running $suite_name...${NC}"
    
    if eval "$command"; then
        echo -e "${GREEN}✓ $suite_name passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $suite_name failed${NC}"
        return 1
    fi
}

# Track overall test status
ALL_PASSED=true

# 1. Run Unit Tests
echo "1. UNIT TESTS"
echo "============="
cd functions
if run_test_suite "Cloud Functions Unit Tests" "npm test -- --passWithNoTests"; then
    echo ""
else
    ALL_PASSED=false
    echo ""
fi
cd ..

# 2. Run Integration Tests
echo "2. INTEGRATION TESTS"
echo "===================="

# Start Firebase emulators in background
echo "Starting Firebase emulators..."
firebase emulators:start --only firestore,auth --project test-project > emulator.log 2>&1 &
EMULATOR_PID=$!

# Wait for emulators to start
echo "Waiting for emulators to start..."
sleep 10

# Check if emulators started successfully
if ! curl -s http://localhost:8080 > /dev/null; then
    echo -e "${RED}Error: Firebase emulators failed to start${NC}"
    kill $EMULATOR_PID 2>/dev/null
    exit 1
fi

cd functions
if run_test_suite "Firestore Security Rules Tests" "npm test integration/firestore.test.js"; then
    echo ""
else
    ALL_PASSED=false
    echo ""
fi
cd ..

# Kill emulators
echo "Stopping Firebase emulators..."
kill $EMULATOR_PID 2>/dev/null
wait $EMULATOR_PID 2>/dev/null

# 3. Run E2E Tests (if Cypress is installed)
if [ -f "node_modules/.bin/cypress" ]; then
    echo "3. END-TO-END TESTS"
    echo "==================="
    
    # Start emulators again for E2E tests
    echo "Starting Firebase emulators for E2E tests..."
    firebase emulators:start > emulator.log 2>&1 &
    EMULATOR_PID=$!
    
    # Wait for emulators
    sleep 10
    
    if run_test_suite "Cypress E2E Tests" "npx cypress run --headless"; then
        echo ""
    else
        ALL_PASSED=false
        echo ""
    fi
    
    # Kill emulators
    echo "Stopping Firebase emulators..."
    kill $EMULATOR_PID 2>/dev/null
    wait $EMULATOR_PID 2>/dev/null
else
    echo -e "${YELLOW}Skipping E2E tests - Cypress not installed${NC}"
    echo "To install Cypress, run: npm install"
    echo ""
fi

# 4. Generate Coverage Report
echo "4. TEST COVERAGE"
echo "================"
cd functions
if [ -d "coverage" ]; then
    echo "Coverage report available at: functions/coverage/lcov-report/index.html"
    
    # Display coverage summary
    if [ -f "coverage/coverage-summary.json" ]; then
        echo ""
        echo "Coverage Summary:"
        node -e "
        const coverage = require('./coverage/coverage-summary.json');
        const total = coverage.total;
        console.log('  Lines:      ' + total.lines.pct + '%');
        console.log('  Statements: ' + total.statements.pct + '%');
        console.log('  Functions:  ' + total.functions.pct + '%');
        console.log('  Branches:   ' + total.branches.pct + '%');
        "
    fi
else
    echo "No coverage report found. Run 'npm run test:coverage' to generate."
fi
cd ..

echo ""
echo "========================================="
if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    exit 1
fi