#!/bin/bash

echo "Setting up Ollama models..."

# Wait for Ollama to be ready
echo "Waiting for Ollama to start..."
sleep 10

# Pull models
echo "Pulling Gemma 3B model..."
docker exec homeai-ollama ollama pull gemma2:3b

echo "Pulling TinyLlama model..."
docker exec homeai-ollama ollama pull tinyllama:latest

echo "Models installed successfully!"
echo "Available models:"
docker exec homeai-ollama ollama list
