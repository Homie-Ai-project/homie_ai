#!/bin/bash

# Wait for Ollama to start
echo "Waiting for Ollama to start..."
sleep 20

# Set Ollama host
export OLLAMA_HOST=http://ollama:11434

# Pull the Gemma 3B model
echo "Pulling Gemma 3B model..."
ollama pull gemma2:3b

# Pull TinyLlama as fallback
echo "Pulling TinyLlama model..."
ollama pull tinyllama:latest

echo "Models installed successfully!"
echo "Available models:"
ollama list
