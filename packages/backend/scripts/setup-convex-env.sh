#!/bin/bash

# Script to manage Convex environment variables
# Usage: ./setup-convex-env.sh push <env-file-path> --environment [production|development]
#        ./setup-convex-env.sh pull <env-file-path> --environment [production|development]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print error messages
error() {
  echo "Error: $1" >&2
  exit 1
}

# Function to print success messages
success() {
  printf "%b\n" "${GREEN}✓ $1${NC}"
}

# Function to print info messages
info() {
  printf "%b\n" "${YELLOW}→ $1${NC}"
}

# Validate arguments
if [ $# -lt 3 ]; then
  error "Invalid number of arguments. Usage: $0 <push|pull> <env-file-path> --environment [production|development]"
fi

COMMAND=$1
ENV_FILE=$2
ENVIRONMENT="development"

# Parse optional environment argument
if [ "$3" = "--environment" ] && [ -n "$4" ]; then
  ENVIRONMENT=$4
fi

# Resolve the file path
ENV_FILE=$(cd "$(dirname "$ENV_FILE")" && pwd)/$(basename "$ENV_FILE")

# Validate command
if [ "$COMMAND" != "push" ] && [ "$COMMAND" != "pull" ]; then
  error "Command must be 'push' or 'pull', got '$COMMAND'"
fi

# Validate environment
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "development" ]; then
  error "Environment must be 'production' or 'development', got '$ENVIRONMENT'"
fi

# Validate env file exists for push command
if [ "$COMMAND" = "push" ] && [ ! -f "$ENV_FILE" ]; then
  error "Env file not found: $ENV_FILE"
fi

# Push environment variables to Convex
push_env() {
  info "Pushing environment variables to Convex ($ENVIRONMENT)..."
  
  if [ ! -f "$ENV_FILE" ]; then
    error "Env file not found: $ENV_FILE"
  fi
  
  # Read the env file and push each variable
  while IFS='=' read -r key value; do
    # Skip empty lines and comments
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    
    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    if [ -z "$key" ] || [ -z "$value" ]; then
      continue
    fi
    
    info "Setting $key..."
    npx convex env set "$key" "$value"
  done < "$ENV_FILE"
  
  success "Environment variables pushed to Convex"
}

# Pull environment variables from Convex
pull_env() {
  info "Pulling environment variables from Convex ($ENVIRONMENT)..."
  
  # Create or clear the env file
  > "$ENV_FILE"
  
  # Fetch all env variables from Convex and write to file
  npx convex env list --json | jq -r '.[] | "\(.name)=\(.value)"' >> "$ENV_FILE"
  
  if [ $? -eq 0 ]; then
    success "Environment variables pulled to $ENV_FILE"
  else
    error "Failed to pull environment variables from Convex"
  fi
}

# Execute the appropriate command
case "$COMMAND" in
  push)
    push_env
    ;;
  pull)
    pull_env
    ;;
esac