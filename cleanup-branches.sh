#!/bin/bash

# TradeFlow - Branch Cleanup Script
# This script deletes stale branches after analysis

# Note: Not using 'set -e' to allow proper error handling in delete_branch function

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo ""
echo "================================================"
echo "  TradeFlow - Branch Cleanup Script"
echo "================================================"
echo ""

print_warning "This will delete multiple stale branches from the remote repository."
print_warning "Make sure you have reviewed BRANCH_CLEANUP.md before proceeding."
echo ""
read -p "Do you want to continue? (yes/no): " confirmation

# Convert to lowercase for case-insensitive comparison
confirmation_lower=$(echo "$confirmation" | tr '[:upper:]' '[:lower:]')

if [[ ! "$confirmation_lower" =~ ^(y|yes)$ ]]; then
    print_info "Cleanup cancelled."
    exit 0
fi

echo ""
print_info "Starting branch cleanup..."
echo ""

# Counter for tracking
deleted=0
failed=0

# Function to delete a branch
delete_branch() {
    local branch=$1
    
    # Check if branch exists on remote
    if ! git ls-remote --heads origin "$branch" | grep -q "$branch"; then
        print_warning "Branch does not exist (may be already deleted): $branch"
        return
    fi
    
    print_info "Deleting branch: $branch"
    
    local error_output
    if error_output=$(git push origin --delete "$branch" 2>&1); then
        print_success "Deleted: $branch"
        ((deleted++))
    else
        print_error "Failed to delete: $branch"
        print_error "  Error: $error_output"
        ((failed++))
    fi
}

# Delete already merged branches
print_info "Deleting merged branches..."
delete_branch "copilot/merge-branches"
delete_branch "copilot/sub-pr-6"
delete_branch "copilot/sub-pr-6-again"
delete_branch "copilot/sub-pr-6-another-one"
delete_branch "copilot/sub-pr-6-one-more-time"
delete_branch "copilot/sub-pr-6-please-work"
delete_branch "copilot/sub-pr-6-yet-again"
delete_branch "copilot/sub-pr-7"

echo ""
print_info "Deleting stale/incomplete branches..."
delete_branch "claude/test-all-functions-011CV4nFtp28nXs6dzFEeAoR"
delete_branch "copilot/fix-setup-functionality-issues"
delete_branch "claude/integrate-multi-app-features-011CUzg8c6nFQpTgZTgWziBV"
delete_branch "claude/integrate-multi-app-features-011CUzgAwjXsFutQ1i3qj4JU"
delete_branch "claude/launch-man-011CUxg2sESL2Cthk8saAexc"
delete_branch "claude/refine-test-expand-features-011CUy2qrMF4PhRp7ATZR84n"
delete_branch "claude/fix-issues-update-011CUzp7pUpwXyp3m4ZDjU8G"

echo ""
print_info "Deleting planning-only branches..."
delete_branch "copilot/resolve-merge-conflicts"
delete_branch "copilot/fix-production-ready-issues"
delete_branch "copilot/review-and-launch-final-version"
delete_branch "copilot/fix-218704489-1088000013-c91f3333-20d5-4dc4-ba52-d15fc1358984"

echo ""
print_info "Deleting superseded feature branches..."
delete_branch "copilot/add-render-yaml-file"
delete_branch "copilot/perform-code-review-and-fix"

echo ""
echo "================================================"
print_success "Branch cleanup completed!"
echo "  Deleted: $deleted branches"
if [ $failed -gt 0 ]; then
    print_warning "  Failed: $failed branches"
fi
echo "================================================"
echo ""
print_info "After this PR is merged to main, remember to also delete:"
print_info "  - copilot/analyze-branches-and-merge (current branch)"
echo ""
