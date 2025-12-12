<div align="center">

# ⚙️ 01 - Prerequisites

[![Prerequisites](https://img.shields.io/badge/Prerequisites-Required-blue?style=for-the-badge)](.)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Required-orange?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

**Required software and tools for setting up the E-Commerce Microservices Platform**

</div>

---

## Required Software

<div align="center">

**Essential tools for development**

</div>

| # | Software | Version | Purpose | Check Command |
|:---:|:---|:---:|:---|:---|
| **1️⃣** | **Node.js** | >= 22.0.0 | Runtime for all services | `node --version` |
| **2️⃣** | **npm** | >= 10.0.0 | Package manager | `npm --version` |
| **3️⃣** | **Docker** | Latest | Container runtime | `docker --version` |
| **4️⃣** | **Docker Compose** | Latest | Multi-container orchestration | `docker compose version` |
| **5️⃣** | **Git** | Latest | Version control | `git --version` |

### 1. Node.js (>= 22.0.0)

<div align="center">

**🟢 Runtime for all services**

</div>

**Why:** All services are built with Node.js and TypeScript.

**Check if installed:**
```bash
node --version
```

**Installation:**
- **🐧 Linux/macOS**: Use [nvm](https://github.com/nvm-sh/nvm) (recommended)
- **🪟 Windows**: Download from [nodejs.org](https://nodejs.org/)

**Verify:** Should show version 22.0.0 or higher.

### 2. npm (>= 10.0.0)

<div align="center">

**📦 Package manager for Node.js dependencies**

</div>

**Why:** Package manager for Node.js dependencies.

**Check if installed:**
```bash
npm --version
```

**Installation:** Comes with Node.js automatically.

**Verify:** Should show version 10.0.0 or higher.

### 3. Docker & Docker Compose

<div align="center">

**🐳 Runs infrastructure services (PostgreSQL, Redis)**

</div>

**Why:** Runs infrastructure services (PostgreSQL, Redis, LocalStack).

**Check if installed:**
```bash
docker --version
docker compose version
```

**Installation:**
- **🐧 Linux**: [Docker Engine](https://docs.docker.com/engine/install/)
- **🍎 macOS**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **🪟 Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Verify:** Both commands should show version numbers.

### 4. Git

<div align="center">

**📝 Version control and cloning repositories**

</div>

**Why:** Version control and cloning the repository.

**Check if installed:**
```bash
git --version
```

**Installation:**
- **🐧 Linux**: `sudo apt install git` (Ubuntu/Debian) or `sudo yum install git` (Fedora/RHEL)
- **🍎 macOS**: `xcode-select --install` or download from [git-scm.com](https://git-scm.com/)
- **🪟 Windows**: Download from [git-scm.com](https://git-scm.com/)

**Verify:** Should show Git version.

## Optional but Recommended

<div align="center">

**Tools that enhance development experience**

</div>

| Tool | Purpose | Installation |
|:---:|:---|:---|
| **🔧 Make** | Simplifies running common commands | See below |
| **📝 Code Editor** | VS Code with extensions | [code.visualstudio.com](https://code.visualstudio.com/) |
| **🧪 API Testing** | Postman or Insomnia | See below |

### Make (for Makefile commands)

<div align="center">

**🔧 Simplifies running common commands**

</div>

**Why:** Simplifies running common commands.

**Check if installed:**
```bash
make --version
```

**Installation:**
- **🐧 Linux**: Usually pre-installed. If not: `sudo apt install make`
- **🍎 macOS**: Usually pre-installed. If not: `xcode-select --install`
- **🪟 Windows**: 
  - Install via [Chocolatey](https://chocolatey.org/): `choco install make`
  - Or use [GnuWin32](http://gnuwin32.sourceforge.net/)

**Note:** On Windows, you can use `make` commands or run npm scripts directly.

### Code Editor

<div align="center">

**📝 Visual Studio Code (Recommended)**

</div>

**Recommended:** Visual Studio Code
- Download from [code.visualstudio.com](https://code.visualstudio.com/)
- **Recommended extensions:**
  - ✅ ESLint
  - ✅ Prettier
  - ✅ Prisma
  - ✅ Docker

### API Testing Tool

<div align="center">

**🧪 Postman or Insomnia**

</div>

**Recommended:** Postman or Insomnia
- **📮 Postman**: [postman.com](https://www.postman.com/)
- **🌙 Insomnia**: [insomnia.rest](https://insomnia.rest/)

## System Requirements

<div align="center">

**Hardware and software requirements**

</div>

### Minimum Requirements

| Component | Minimum | Recommended |
|:---:|:---:|:---:|
| **💾 RAM** | 8GB | 16GB |
| **💿 Disk Space** | 10GB | 20GB+ |
| **⚡ CPU** | 2 cores | 4 cores |

### Docker Requirements

| Component | Version | Notes |
|:---:|:---|:---|
| **🐳 Docker** | 20.10+ | Latest recommended |
| **🐳 Docker Compose** | 2.0+ | Included with Docker Desktop |
| **🐧 WSL2** | Latest | Windows only - Required for Docker Desktop |

## Verification Checklist

<div align="center">

**Before proceeding to setup, verify all prerequisites:**

</div>

| Status | Requirement | Command to Verify |
|:---:|:---|:---|
| ⬜ | **Node.js >= 22.0.0** | `node --version` |
| ⬜ | **npm >= 10.0.0** | `npm --version` |
| ⬜ | **Docker installed and running** | `docker --version` |
| ⬜ | **Docker Compose installed** | `docker compose version` |
| ⬜ | **Git installed** | `git --version` |
| ⬜ | **Make installed** (optional) | `make --version` |
| ⬜ | **Code editor installed** (recommended) | - |
| ⬜ | **At least 10GB free disk space** | `df -h` (Linux/macOS) |
| ⬜ | **At least 8GB RAM available** | System settings |

## Platform-Specific Notes

<div align="center">

**Platform-specific setup requirements**

</div>

### 🐧 Linux

| Task | Command |
|:---:|:---|
| **Start Docker daemon** | `sudo systemctl start docker` |
| **Add user to docker group** | `sudo usermod -aG docker $USER` |
| **Apply changes** | Log out and back in |

### 🍎 macOS

| Requirement | Details |
|:---:|:---|
| **Docker Desktop** | Must be running (check menu bar) |
| **Resources** | Settings → Resources |
| **Minimum** | 4GB RAM, 2 CPUs |

### 🪟 Windows

| Requirement | Details |
|:---:|:---|
| **WSL2** | Must be installed and enabled |
| **Docker Desktop** | Must be running |
| **Virtualization** | Enabled in BIOS |
| **Windows Version** | Windows 10 version 2004 or higher |

---

<div align="center">

## 🚀 Next Steps

**Once all prerequisites are installed:**

**[🐧 Linux Setup →](./02-linux-setup.md)** | **[🍎 macOS Setup →](./03-macos-setup.md)** | **[🪟 Windows Setup →](./04-windows-setup.md)**

---

**Navigation:**
- ⬅️ [← Back to Setup Overview](./README.md)
- ➡️ [Next: Linux Setup →](./02-linux-setup.md)

[Back to Top](#-01---prerequisites)

</div>

