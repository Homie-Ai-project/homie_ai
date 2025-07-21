#!/bin/bash

#     echo "  pull      - Pull a new Ollama model"
    echo "  models    - List installed models"
    echo "  gpu       - Check GPU status and usage"
    echo "  test      - Test chat functionality"
    echo "  web       - Open web interface in browser"eAI Docker Management Script

function show_help() {
    echo "🐾 Cat GPT - Grumpy AI Assistant Management Script"
    echo "================================================"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all Cat GPT containers"
    echo "  stop      - Stop all containers"
    echo "  restart   - Restart all containers"
    echo "  status    - Show container status"
    echo "  logs      - Show container logs"
    echo "  pull      - Pull a new Ollama model"
    echo "  models    - List installed models"
    echo "  web       - Open React web interface in browser"
    echo "  webui     - Open Open WebUI interface in browser"
    echo "  help      - Show this help message"
    echo ""
    echo "Web Interfaces:"
    echo "  Cat GPT:     http://localhost:3000 (Grumpy cat chat interface 😾)"
    echo "  Open WebUI:  http://localhost:8080 (Advanced Ollama interface)"
    echo "  Ollama API:  http://localhost:11434 (Direct API access)"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 pull llama2:7b"
    echo "  $0 webui"
}

function start_containers() {
    echo "Starting HomeAI containers..."
    docker-compose up -d
    echo "Containers started successfully!"
    echo ""
    echo "🚀 Available Interfaces:"
    echo "📱 CatGPT App:      http://localhost:3000"
    echo "🌐 Open WebUI:      http://localhost:8080"
    echo "🔧 Ollama API:      http://localhost:11434"
    echo ""
    echo "💡 Tip: Use './homeai.sh webui' to open Open WebUI"
}

function stop_containers() {
    echo "Stopping HomeAI containers..."
    docker-compose down
    echo "Containers stopped successfully!"
}

function restart_containers() {
    echo "Restarting HomeAI containers..."
    docker-compose restart
    echo "Containers restarted successfully!"
}

function test_chat() {
    echo "🐾 Testing Cat GPT Functionality"
    echo "================================"
    echo ""

    echo "1. Testing Models API..."
    models=$(curl -s http://localhost:3000/api/tags | jq -r '.models[0].name' 2>/dev/null)
    if [ "$models" = "tinyllama:latest" ] || [ -n "$models" ]; then
        echo "   ✅ Models API working: $models"
    else
        echo "   ❌ Models API failed"
        return 1
    fi

    echo ""
    echo "2. Testing Cat Personality..."
    response=$(curl -s -X POST http://localhost:3000/api/generate \
        -H "Content-Type: application/json" \
        -d '{"model":"'$models'","prompt":"Hello","stream":false}' | \
        jq -r '.response' 2>/dev/null)

    if [ -n "$response" ] && [ "$response" != "null" ]; then
        echo "   ✅ Cat GPT working"
        echo "   😾 Cat Response: $response"
    else
        echo "   ❌ Cat GPT failed"
        return 1
    fi

    echo ""
    echo "🎉 All tests passed! Your grumpy cat AI is ready!"
    echo "� Open http://localhost:3000 to chat with your cat!"
}

function check_gpu() {
    echo "🔥 GPU Status Check"
    echo "==================="
    if command -v nvidia-smi > /dev/null; then
        echo "GPU Hardware:"
        gpu_info=$(nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv,noheader,nounits)
        name=$(echo "$gpu_info" | cut -d',' -f1 | xargs)
        mem_used=$(echo "$gpu_info" | cut -d',' -f2 | xargs)
        mem_total=$(echo "$gpu_info" | cut -d',' -f3 | xargs)
        util=$(echo "$gpu_info" | cut -d',' -f4 | xargs)
        temp=$(echo "$gpu_info" | cut -d',' -f5 | xargs)
        
        echo "  Name: $name"
        echo "  Memory: ${mem_used}MB / ${mem_total}MB ($(( mem_used * 100 / mem_total ))% used)"
        echo "  Utilization: ${util}%"
        echo "  Temperature: ${temp}°C"
        echo ""
        echo "Ollama GPU Configuration:"
        docker logs homeai-ollama --tail 100 2>/dev/null | grep -E "(inference compute|CUDA.*buffer|name.*GeForce)" | tail -3 || echo "  No GPU info found in logs"
    else
        echo "❌ NVIDIA drivers not installed"
    fi
}

function show_status() {
    echo "Container Status:"
    echo "=================="
    docker-compose ps
    echo ""
    echo "Available Models:"
    echo "=================="
    docker exec homeai-ollama ollama list 2>/dev/null || echo "Ollama container not running"
    echo ""
    check_gpu
}

function show_logs() {
    echo "Container Logs:"
    echo "==============="
    docker-compose logs --tail=20
}

function pull_model() {
    if [ -z "$2" ]; then
        echo "Please specify a model to pull."
        echo "Example: $0 pull tinyllama"
        echo "Popular models: tinyllama, llama2:7b, mistral:7b, codellama:7b"
        exit 1
    fi
    
    echo "Pulling model: $2"
    docker exec homeai-ollama ollama pull "$2"
}

function list_models() {
    echo "Installed Models:"
    echo "=================="
    docker exec homeai-ollama ollama list
}

function open_web() {
    echo "Opening React chat interface..."
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:3000
    elif command -v open > /dev/null; then
        open http://localhost:3000
    else
        echo "Please open http://localhost:3000 in your browser"
    fi
}

function open_webui() {
    echo "Opening Open WebUI interface..."
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:8080
    elif command -v open > /dev/null; then
        open http://localhost:8080
    else
        echo "Please open http://localhost:8080 in your browser"
    fi
}

# Change to the script's directory
cd "$(dirname "$0")"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found in current directory"
    echo "Please run this script from the HomeAI project directory"
    exit 1
fi

# Parse command
case "$1" in
    "start")
        start_containers
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        restart_containers
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "pull")
        pull_model "$@"
        ;;
    "models")
        list_models
        ;;
    "web")
        open_web
        ;;
    "webui")
        open_webui
        ;;
    "test")
        test_chat
        ;;
    "gpu")
        check_gpu
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
