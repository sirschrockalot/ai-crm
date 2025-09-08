#!/bin/bash

# Transactions Service Test Script

echo "🧪 Testing Transactions Service..."

# Wait for service to be ready
echo "⏳ Waiting for service to start..."
sleep 5

# Test health endpoint
echo "🔍 Testing health endpoint..."
curl -s http://localhost:3003/api/v1/health | jq '.' || echo "❌ Health check failed"

# Test create transaction
echo "📝 Testing create transaction..."
TRANSACTION_RESPONSE=$(curl -s -X POST http://localhost:3003/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Test Street",
    "city": "Test City",
    "state": "GA",
    "zip": "30309",
    "contractDate": "2024-01-15T00:00:00.000Z",
    "propertyType": "single_family",
    "transactionType": "assignment",
    "sellerName": "Test Seller",
    "buyerName": "Test Buyer",
    "coordinatorName": "Test Coordinator"
  }')

echo "Transaction created:"
echo $TRANSACTION_RESPONSE | jq '.'

# Extract transaction ID
TRANSACTION_ID=$(echo $TRANSACTION_RESPONSE | jq -r '.id')
echo "Transaction ID: $TRANSACTION_ID"

# Test get transaction
echo "📖 Testing get transaction..."
curl -s http://localhost:3003/api/v1/transactions/$TRANSACTION_ID | jq '.' || echo "❌ Get transaction failed"

# Test add activity
echo "💬 Testing add activity..."
curl -s -X POST http://localhost:3003/api/v1/transactions/$TRANSACTION_ID/activities \
  -H "Content-Type: application/json" \
  -d '{
    "user": "Test User",
    "userEmail": "test@example.com",
    "message": "Test message from script"
  }' | jq '.' || echo "❌ Add activity failed"

# Test update status
echo "🔄 Testing update status..."
curl -s -X PATCH http://localhost:3003/api/v1/transactions/$TRANSACTION_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending_closing"
  }' | jq '.' || echo "❌ Update status failed"

# Test get all transactions
echo "📋 Testing get all transactions..."
curl -s http://localhost:3003/api/v1/transactions | jq '.[0]' || echo "❌ Get all transactions failed"

# Test statistics
echo "📊 Testing statistics..."
curl -s http://localhost:3003/api/v1/transactions/stats | jq '.' || echo "❌ Get stats failed"

echo "✅ Transactions Service tests completed!"
