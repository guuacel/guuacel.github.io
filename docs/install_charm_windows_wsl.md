# Charm-Crypto Installation Guide on Windows + WSL2 + Ubuntu

This document provides Chinese and English installation instructions for Charm-Crypto on Windows through WSL2 and Ubuntu.

## 中文版本

### 安装目标

目标是在 Windows 主机中使用 WSL2 运行 Ubuntu，并在 Ubuntu 环境中安装 Charm-Crypto 所需的系统依赖、PBC 1.0.0、Python 虚拟环境和 Charm-Crypto。安装完成后，通过 `PairingGroup('SS512')` 生成 G1 群元素、ZR 指数并计算 `g^x`，确认 Charm-Crypto 可以正常工作。

### 为什么不建议原生 Windows 安装

Charm-Crypto 依赖 C/C++ 编译链、Python 开发头文件、GMP、OpenSSL 和 PBC 等底层库。原生 Windows 环境下通常需要手动处理编译器、动态库路径和头文件路径，安装失败概率较高。WSL2 提供接近 Linux 的构建环境，因此 Windows 用户推荐使用 WSL2 + Ubuntu。

以下命令中，WSL 安装命令在管理员 PowerShell 中执行；其余 Linux 命令均在 Ubuntu / WSL2 终端中执行。

### 安装 WSL2 和 Ubuntu

首先检查当前 Windows 是否已经安装 WSL2 和 Ubuntu：

```powershell
wsl --status
wsl -l -v
```

作用：`wsl --status` 用于查看 WSL 默认版本和内核状态；`wsl -l -v` 用于查看已经安装的 Linux 发行版及其 WSL 版本。

如果没有安装 Ubuntu，请以管理员身份打开 PowerShell，执行：

```powershell
wsl --install -d Ubuntu
```

作用：该命令会安装 WSL 并指定安装 Ubuntu 发行版。安装完成后按提示重启 Windows，然后从开始菜单打开 Ubuntu，创建 Linux 用户名和密码。

建议更新 WSL 内核和 Ubuntu 软件包：

```powershell
wsl --update
```

进入 Ubuntu 后执行：

```bash
sudo apt update
sudo apt upgrade -y
```

作用：`wsl --update` 更新 WSL 内核；`apt update` 刷新软件源索引；`apt upgrade` 更新系统软件包。

### 安装系统依赖

在 Ubuntu / WSL2 中执行：

```bash
sudo apt update
sudo apt install -y build-essential flex bison wget m4 python3 python3-dev python3-pip python3-setuptools python3-venv libgmp-dev libssl-dev git
```

作用说明：

- `build-essential` 提供 gcc、g++、make 等基础编译工具。
- `flex`、`bison`、`m4` 用于构建过程中生成词法和语法相关代码。
- `wget` 用于下载 PBC 源码包。
- `python3`、`python3-dev`、`python3-pip`、`python3-setuptools`、`python3-venv` 用于 Python 包构建、安装和虚拟环境管理。
- `libgmp-dev` 提供 GMP 开发库。
- `libssl-dev` 提供 OpenSSL 开发库。
- `git` 用于在 pip 安装失败时克隆 Charm 源码仓库。

### 安装 PBC

PBC 是 Pairing-Based Cryptography Library。Charm-Crypto 的 pairing group 功能需要它。

```bash
cd ~
wget https://crypto.stanford.edu/pbc/files/pbc-1.0.0.tar.gz
tar -xzf pbc-1.0.0.tar.gz
cd pbc-1.0.0
./configure
make
sudo make install
sudo ldconfig
```

作用说明：

- `wget` 下载 `pbc-1.0.0.tar.gz`。
- `tar -xzf` 解压源码包。
- `./configure` 检查系统环境并生成 Makefile。
- `make` 编译 PBC。
- `sudo make install` 将 PBC 头文件和动态库安装到系统目录。
- `sudo ldconfig` 刷新动态链接库缓存，避免运行时找不到 `libpbc.so`。

安装后可以检查：

```bash
ls /usr/local/include/pbc.h
ldconfig -p | grep libpbc
```

作用：确认 PBC 头文件和动态库已经进入系统路径。

### 创建 Python 虚拟环境

虚拟环境名称设为 `charm-venv`：

```bash
cd ~
python3 -m venv charm-venv
source charm-venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install "pyparsing>=3.1.0,<4.0" pytest hypothesis
```

作用说明：

- `python3 -m venv charm-venv` 创建独立 Python 环境。
- `source charm-venv/bin/activate` 激活虚拟环境。
- `pip setuptools wheel` 用于构建和安装 Python 包。
- `pyparsing`、`pytest`、`hypothesis` 是 Charm 安装和测试中常见的 Python 依赖。

### 安装 Charm-Crypto

优先尝试通过 pip 安装 Charm-Crypto：

```bash
source ~/charm-venv/bin/activate
pip install charm-crypto-framework
```

作用：如果 pip 能找到与你的 Python 版本和系统环境匹配的包，这一步会直接完成 Charm-Crypto 安装。

### 失败时的源码安装方案

如果 `pip install charm-crypto-framework` 失败，请改用源码安装方式：

```bash
cd ~
source ~/charm-venv/bin/activate
git clone https://github.com/JHUISI/charm.git
cd charm
./configure.sh
make
sudo make install
sudo ldconfig
```

作用说明：

- `git clone` 下载 Charm 源码。
- `./configure.sh` 检查 Charm 构建环境。
- `make` 编译 Charm。
- `sudo make install` 安装 Charm。
- `sudo ldconfig` 更新动态库缓存。

### 测试 Charm 是否安装成功

创建测试脚本 `test_charm.py`：

```bash
cd ~
source charm-venv/bin/activate
cat > test_charm.py <<'PY'
from charm.toolbox.pairinggroup import PairingGroup, G1, ZR

group = PairingGroup('SS512')
g = group.random(G1)
x = group.random(ZR)
y = g ** x

print("g =", g)
print("x =", x)
print("g^x =", y)
print("Charm-Crypto installed successfully.")
PY

python test_charm.py
```

作用：该脚本导入 `PairingGroup`，使用 `SS512` 参数，随机生成 G1 群元素和 ZR 指数，并执行 `g^x`。如果输出 `Charm-Crypto installed successfully.` 且没有报错，说明安装成功。

推荐的最终运行方式：

```bash
source charm-venv/bin/activate
python test_charm.py
```

### 常见错误与解决方案

#### 找不到 pbc.h

原因：PBC 头文件没有安装，或者编译器找不到头文件路径。

```bash
ls /usr/local/include/pbc.h
cd ~/pbc-1.0.0
sudo make install
```

作用：确认 `pbc.h` 是否存在；如果不存在或安装不完整，重新执行安装。

#### 找不到 libpbc.so

原因：动态库路径未刷新，或者系统运行时找不到 PBC 动态库。

```bash
sudo ldconfig
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
python test_charm.py
```

作用：`ldconfig` 刷新系统动态库缓存；`LD_LIBRARY_PATH` 临时添加 `/usr/local/lib`。

#### ImportError

原因：虚拟环境未激活，或者 Charm 安装到了另一个 Python 环境。

```bash
source ~/charm-venv/bin/activate
which python
python -c "import charm; print(charm)"
```

作用：确认当前 Python 来自 `charm-venv`，并验证 Charm 是否可导入。

#### pip install charm-crypto 失败

原因：旧包名、Python 版本或构建环境不兼容。

```bash
pip install charm-crypto-framework
# 如果失败，执行源码安装：
cd ~
git clone https://github.com/JHUISI/charm.git
```

作用：优先使用 `charm-crypto-framework`；失败后切换到源码构建。

#### Python 版本不兼容

原因：过新的 Python 版本可能导致 pyparsing 或 C 扩展构建不兼容。

```bash
python --version
python -m pip install "pyparsing>=3.1.0,<4.0"
```

作用：检查 Python 版本，并安装兼容的 pyparsing 版本。建议优先使用 Ubuntu LTS 默认 Python 版本，例如 Python 3.10 或 3.11。

#### WSL 中没有安装 gcc/make

原因：`build-essential` 没有安装或安装失败。

```bash
sudo apt update
sudo apt install -y build-essential
gcc --version
make --version
```

作用：安装 gcc 和 make，并验证二者是否可用。

## English Version

### Installation Goal

The goal is to run Ubuntu through WSL2 on Windows, install the required system dependencies, build PBC 1.0.0, create a Python virtual environment, install Charm-Crypto, and verify the installation by using `PairingGroup('SS512')` to generate a G1 element, a ZR exponent, and compute `g^x`.

### Why Native Windows Installation Is Not Recommended

Charm-Crypto depends on a C/C++ build toolchain, Python development headers, GMP, OpenSSL, and PBC. Native Windows builds often fail because compiler paths, header paths, and shared-library paths must be handled manually. WSL2 provides a Linux-compatible build environment, so WSL2 + Ubuntu is the recommended route for Windows users.

Run the WSL installation command in Administrator PowerShell. Run all other Linux commands inside the Ubuntu / WSL2 terminal.

### Install WSL2 and Ubuntu

Check whether WSL2 and Ubuntu are already installed:

```powershell
wsl --status
wsl -l -v
```

Purpose: `wsl --status` shows WSL default version and kernel status; `wsl -l -v` lists installed Linux distributions and their WSL versions.

If Ubuntu is not installed, open PowerShell as Administrator and run:

```powershell
wsl --install -d Ubuntu
```

Purpose: this command installs WSL and selects Ubuntu as the Linux distribution. Restart Windows if prompted, then open Ubuntu from the Start menu and create your Linux username and password.

Update WSL and Ubuntu packages:

```powershell
wsl --update
```

Inside Ubuntu, run:

```bash
sudo apt update
sudo apt upgrade -y
```

Purpose: `wsl --update` updates the WSL kernel; `apt update` refreshes package indexes; `apt upgrade` updates installed packages.

### Install System Dependencies

Inside Ubuntu / WSL2, run:

```bash
sudo apt update
sudo apt install -y build-essential flex bison wget m4 python3 python3-dev python3-pip python3-setuptools python3-venv libgmp-dev libssl-dev git
```

Purpose:

- `build-essential` provides gcc, g++, make, and related build tools.
- `flex`, `bison`, and `m4` are used by source builds.
- `wget` downloads the PBC source archive.
- `python3`, `python3-dev`, `python3-pip`, `python3-setuptools`, and `python3-venv` support Python package builds and virtual environments.
- `libgmp-dev` provides GMP development files.
- `libssl-dev` provides OpenSSL development files.
- `git` is required for the source-install fallback.

### Install PBC

PBC is the Pairing-Based Cryptography Library. Charm-Crypto uses it for pairing groups.

```bash
cd ~
wget https://crypto.stanford.edu/pbc/files/pbc-1.0.0.tar.gz
tar -xzf pbc-1.0.0.tar.gz
cd pbc-1.0.0
./configure
make
sudo make install
sudo ldconfig
```

Purpose:

- `wget` downloads `pbc-1.0.0.tar.gz`.
- `tar -xzf` extracts the source archive.
- `./configure` checks the system and generates Makefiles.
- `make` compiles PBC.
- `sudo make install` installs headers and shared libraries.
- `sudo ldconfig` refreshes the runtime shared-library cache.

Verify PBC:

```bash
ls /usr/local/include/pbc.h
ldconfig -p | grep libpbc
```

Purpose: confirm that the PBC header and shared library are visible to the system.

### Create a Python Virtual Environment

Create a virtual environment named `charm-venv`:

```bash
cd ~
python3 -m venv charm-venv
source charm-venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install "pyparsing>=3.1.0,<4.0" pytest hypothesis
```

Purpose:

- `python3 -m venv charm-venv` creates an isolated Python environment.
- `source charm-venv/bin/activate` activates it.
- `pip setuptools wheel` help build and install Python packages.
- `pyparsing`, `pytest`, and `hypothesis` are common Charm installation and testing dependencies.

### Install Charm-Crypto

Try pip first:

```bash
source ~/charm-venv/bin/activate
pip install charm-crypto-framework
```

Purpose: if pip can find a package compatible with your Python version and system environment, this completes the Charm-Crypto installation.

### Source Installation Fallback

If `pip install charm-crypto-framework` fails, install from source:

```bash
cd ~
source ~/charm-venv/bin/activate
git clone https://github.com/JHUISI/charm.git
cd charm
./configure.sh
make
sudo make install
sudo ldconfig
```

Purpose:

- `git clone` downloads the Charm source repository.
- `./configure.sh` checks the Charm build environment.
- `make` compiles Charm.
- `sudo make install` installs Charm.
- `sudo ldconfig` refreshes the shared-library cache.

### Verify the Installation

Create `test_charm.py`:

```bash
cd ~
source charm-venv/bin/activate
cat > test_charm.py <<'PY'
from charm.toolbox.pairinggroup import PairingGroup, G1, ZR

group = PairingGroup('SS512')
g = group.random(G1)
x = group.random(ZR)
y = g ** x

print("g =", g)
print("x =", x)
print("g^x =", y)
print("Charm-Crypto installed successfully.")
PY

python test_charm.py
```

Purpose: the script imports `PairingGroup`, uses the `SS512` parameter set, generates a random G1 element and a random ZR exponent, and computes `g^x`. If the script prints `Charm-Crypto installed successfully.` without errors, the installation is working.

Recommended final run:

```bash
source charm-venv/bin/activate
python test_charm.py
```

### Common Errors and Fixes

#### pbc.h not found

Cause: the PBC header was not installed, or the compiler cannot find it.

```bash
ls /usr/local/include/pbc.h
cd ~/pbc-1.0.0
sudo make install
```

Purpose: confirm that `pbc.h` exists and reinstall PBC if needed.

#### libpbc.so not found

Cause: the runtime library cache or library path does not include PBC.

```bash
sudo ldconfig
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
python test_charm.py
```

Purpose: `ldconfig` refreshes the shared-library cache; `LD_LIBRARY_PATH` temporarily adds `/usr/local/lib`.

#### ImportError

Cause: the virtual environment is not active, or Charm was installed into another Python environment.

```bash
source ~/charm-venv/bin/activate
which python
python -c "import charm; print(charm)"
```

Purpose: confirm that Python comes from `charm-venv` and that Charm can be imported.

#### pip install charm-crypto fails

Cause: the old package name, Python version, or build environment may be incompatible.

```bash
pip install charm-crypto-framework
# If it fails, use source installation:
cd ~
git clone https://github.com/JHUISI/charm.git
```

Purpose: try `charm-crypto-framework` first; if pip fails, switch to the source build.

#### Python version incompatibility

Cause: newer Python versions may trigger pyparsing or C-extension build incompatibilities.

```bash
python --version
python -m pip install "pyparsing>=3.1.0,<4.0"
```

Purpose: check Python and install a compatible pyparsing version. Prefer the Python version shipped with Ubuntu LTS, such as Python 3.10 or 3.11.

#### gcc/make is missing in WSL

Cause: `build-essential` is missing or failed to install.

```bash
sudo apt update
sudo apt install -y build-essential
gcc --version
make --version
```

Purpose: install gcc and make, then verify they are available.

## References

- Charm-Crypto Platform Install Manual: https://jhuisi.github.io/charm/install_source.html
- JHUISI Charm source repository: https://github.com/JHUISI/charm
- PBC Library downloads: https://crypto.stanford.edu/pbc/download.html
- Microsoft WSL installation guide: https://learn.microsoft.com/en-us/windows/wsl/install
