# HomeAI - Complete Ollama AI Platform

A comprehensive Docker-based AI platform featuring Ollama with multiple web interfaces for AI model interaction.

## Features

- 🤖 **Ollama AI Server** - Local AI model hosting
- 🌐 **Open WebUI** - Advanced web interface with authentication, chat history, and more
- 📱 **Custom React App** - Lightweight, modern chat interface  
- 🎨 **Modern UI Design** - Responsive interfaces with gradient styling
- 🔄 **Real-time Model Selection** - Switch between AI models on the fly
- 🐳 **Fully Containerized** - Easy deployment with Docker Compose
- 📱 **Mobile-Friendly** - All interfaces work perfectly on mobile devices

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- At least 4GB of RAM available for Ollama

### Running the Application

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Pull an AI model (required for first use):**
   ```bash
   # Pull a lightweight model (recommended for testing)
   docker exec homeai-ollama ollama pull tinyllama
   
   # Or pull other popular models:
   docker exec homeai-ollama ollama pull llama2:7b
   docker exec homeai-ollama ollama pull mistral:7b
   ```

3. **Access the interfaces:**
   - **Open WebUI**: http://localhost:8080 (Advanced interface with auth, history, etc.)
   - **React Chat**: http://localhost:3000 (Lightweight custom interface)
   - **Ollama API**: http://localhost:11434 (Direct API access)

## Web Interfaces

### 🌐 Open WebUI (Port 8080)
**Recommended for most users**
- User authentication and management
- Chat history and conversation management
- Model comparison and testing
- Advanced settings and configurations
- Document upload and analysis
- Plugin ecosystem
- Multi-user support

### 📱 Custom React App (Port 3000)
**Great for developers and lightweight usage**
- Minimal, fast interface
- Modern React/TypeScript codebase
- Real-time model switching
- Mobile-optimized design
- Direct Ollama API integration

### Available Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Management script commands
./homeai.sh start          # Start all containers
./homeai.sh stop           # Stop all containers  
./homeai.sh status         # Show container status
./homeai.sh logs           # View logs

# Open web interfaces
./homeai.sh webui          # Open Open WebUI (recommended)
./homeai.sh web            # Open React chat app

# Model management
./homeai.sh pull <model>   # Pull a new model
./homeai.sh models         # List installed models

# Examples
./homeai.sh pull llama2:7b
./homeai.sh pull mistral:7b
```

### Ollama Model Management

```bash
# Pull additional Ollama models
docker exec homeai-ollama ollama pull <model-name>

# List available models
docker exec homeai-ollama ollama list

# Remove a model
docker exec homeai-ollama ollama rm <model-name>
```

## Architecture

- **Ollama Container**: AI model server on port 11434
- **Open WebUI Container**: Advanced web interface on port 8080
- **React App Container**: Custom chat interface on port 3000  
- **Docker Network**: All containers communicate via `homeai-network`
- **Persistent Storage**: 
  - Ollama models stored in `ollama_data` volume
  - Open WebUI data stored in `open_webui_data` volume

## Popular Ollama Models

Here are some popular models you can try:

```bash
# Lightweight models (good for testing)
docker exec homeai-ollama ollama pull llama2:7b
docker exec homeai-ollama ollama pull mistral:7b

# Code-focused models
docker exec homeai-ollama ollama pull codellama:7b
docker exec homeai-ollama ollama pull codegemma:7b

# Larger, more capable models (require more RAM)
docker exec homeai-ollama ollama pull llama2:13b
docker exec homeai-ollama ollama pull mistral:7b-instruct

# Tiny models (very fast, basic capabilities)
docker exec homeai-ollama ollama pull tinyllama
docker exec homeai-ollama ollama pull phi:2.7b
```

## Development

### Project Structure

```
homeai/
├── docker-compose.yml          # Container orchestration
├── homeai.sh                   # Management script
├── webapp/                     # React/TypeScript frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx           # App entry point
│       ├── App.tsx            # Main component
│       ├── App.css            # Styles
│       ├── index.css          # Global styles
│       └── vite-env.d.ts      # TypeScript definitions
└── README.md

# Container Overview:
# ├── homeai-ollama        (AI model server)
# ├── homeai-open-webui    (Advanced web interface) 
# └── homeai-webapp        (Custom React chat app)
```

### Environment Variables

- `OLLAMA_BASE_URL`: URL for Ollama API (used by Open WebUI)
- `VITE_OLLAMA_API_URL`: URL for Ollama API (used by React app)
- `WEBUI_SECRET_KEY`: Secret key for Open WebUI sessions

## Troubleshooting

### Containers won't start
- Ensure you have enough disk space for Docker images
- Check if ports 3000, 8080, or 11434 are already in use
- Run `docker-compose logs` to see detailed error messages

### No models available
- You need to pull at least one model: `./homeai.sh pull tinyllama`
- Wait for the model download to complete before using the interfaces
- Check model status: `./homeai.sh models`

### Open WebUI can't connect to Ollama
- Ensure both containers are running: `docker-compose ps`
- Check Ollama logs: `docker-compose logs ollama`
- Verify network connectivity: `docker exec homeai-open-webui ping ollama`

### React app can't connect to Ollama
- Check that Ollama container is running and healthy
- Verify API endpoint: `curl http://localhost:11434/api/tags`
- Check browser console for CORS or network errors

### Performance issues
- Ollama models require significant RAM. Start with smaller models like `tinyllama` or `phi:2.7b`
- Monitor system resources: `docker stats`

## Stopping the Application

```bash
# Stop containers but keep data
docker-compose down

# Stop containers and remove volumes (deletes downloaded models)
docker-compose down -v
```

## GPU Acceleration

This setup supports NVIDIA GPU acceleration for faster AI inference:

### GPU Requirements
- NVIDIA GPU with CUDA support (RTX 20xx series or newer recommended)
- NVIDIA drivers installed
- NVIDIA Container Toolkit (automatically installed by the setup)

### GPU Status
Check if GPU acceleration is working:
```bash
./homeai.sh gpu
```

This will show:
- GPU hardware information (name, memory usage, temperature)
- Whether Ollama is using GPU acceleration
- CUDA buffer allocation details

### Performance Benefits
With GPU acceleration enabled:
- **TinyLlama**: ~10-20x faster inference
- **Larger models**: Even greater speed improvements
- **Memory**: Models loaded on GPU VRAM for faster access

### GPU Memory Usage
Monitor GPU memory usage in real-time:
```bash
watch -n 1 nvidia-smi
```

The Ollama container automatically detects and uses your GPU when available.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `docker-compose up`
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development!
