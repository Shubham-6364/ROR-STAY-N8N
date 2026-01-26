# Server Startup Guide - ROR-STAY-N8N-LITE

## ⚠️ Issue: "This site can't be reached"

**This means the web server is not running!**

## ✅ Solution: Start the Server

### Method 1: Simple Start (Recommended)

```bash
cd /home/azureuser/ROR-STAY-N8N-LITE/public
python3 -m http.server 8000
```

### Method 2: Using the Script

```bash
cd /home/azureuser/ROR-STAY-N8N-LITE
./start.sh
```

## 📍 Where to Access

After starting the server, open in your browser:

- **Main Page**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin.html

## ❓ Important Notes

### If accessing from REMOTE machine:

If you're running the server on Azure VM but trying to access from your local computer, you need:

1. **Use the server's public IP** instead of localhost:
   ```
   http://YOUR_SERVER_IP:8000
   ```

2. **Open the port in Azure firewall**:
   - Go to Azure Portal
   - Navigate to your VM → Networking
   - Add inbound port rule for port 8000

### If accessing from SAME machine (localhost):

Just use: http://localhost:8000

## 🔍 Verify Server is Running

```bash
# Check if port 8000 is in use
lsof -i :8000

# Check for Python server process
ps aux | grep "python.*http.server"
```

## 🛑 Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

## 🔄 Restart the Server

1. Stop: `Ctrl+C`
2. Start again:
   ```bash
   cd /home/azureuser/ROR-STAY-N8N-LITE/public
   python3 -m http.server 8000
   ```

---

**The server must be running for the website to work!**
