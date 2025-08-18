# Installation Guide - Resume Generator

The Resume Generator is distributed as **unsigned portable applications** for easy download and use without requiring installation or administrator privileges.

## Download

Download the appropriate version for your operating system from the [latest release](../../releases/latest):

- **Windows**: `ResumeGenerator-*-win-portable.exe`
- **macOS**: `ResumeGenerator-*-mac.dmg`
- **Linux**: `ResumeGenerator-*-linux.AppImage`

---

## Windows Installation

### Quick Start

1. Download `ResumeGenerator-*-win-portable.exe`
2. Double-click the file to run immediately - **no installation required!**
3. The app runs directly from the executable

### Windows Security Warning

Since the app is unsigned, Windows Defender SmartScreen may show a warning:

1. Click "More info" on the SmartScreen dialog
2. Click "Run anyway" to launch the application
3. You may need to add an exception in your antivirus software

### Windows Tips

- Create a desktop shortcut by right-clicking the executable
- Pin to taskbar for easy access
- Move the .exe file to a permanent location before creating shortcuts

---

## macOS Installation

### Quick Start

1. Download `ResumeGenerator-*-mac.dmg`
2. Double-click the DMG file to open it
3. Drag the Resume Generator app to your Applications folder
4. **Important**: Use the bypass method below for first launch

### Bypassing Gatekeeper (Required for Unsigned Apps)

#### Method 1: Right-click to Open

1. Go to Applications folder
2. **Right-click** on "Resume Generator"
3. Select "Open" from the context menu
4. Click "Open" in the security dialog
5. The app will now run normally for future launches

#### Method 2: Terminal Command

Open Terminal and run:

```bash
xattr -c "/Applications/Resume Generator.app"
open "/Applications/Resume Generator.app"
```

#### Method 3: System Preferences (macOS Ventura and earlier)

1. Try to open the app normally (it will be blocked)
2. Go to System Preferences → Security & Privacy → General
3. Click "Open Anyway" next to the blocked app message
4. Confirm by clicking "Open"

### macOS Architecture Support

- **Intel Macs**: Fully supported
- **Apple Silicon (M1/M2/M3)**: Fully supported natively

---

## Linux Installation

### Quick Start

1. Download `ResumeGenerator-*-linux.AppImage`
2. Make it executable: `chmod +x ResumeGenerator-*-linux.AppImage`
3. Double-click to run or execute from terminal: `./ResumeGenerator-*-linux.AppImage`

### Alternative Installation Methods

#### Desktop Integration (Optional)

To add the app to your applications menu:

```bash
# Download and install AppImageLauncher (Ubuntu/Debian)
sudo apt install software-properties-common
sudo add-apt-repository ppa:appimagelauncher-team/stable
sudo apt update
sudo apt install appimagelauncher

# Then simply run the AppImage - it will offer to integrate
./ResumeGenerator-*-linux.AppImage
```

#### Manual Desktop Entry

Create a desktop file:

```bash
cat > ~/.local/share/applications/resume-generator.desktop << EOF
[Desktop Entry]
Name=Resume Generator
Exec=/path/to/ResumeGenerator-*-linux.AppImage
Icon=/path/to/icon.png
Type=Application
Categories=Office;
EOF
```

### Linux Permissions

If you get permission errors:

```bash
chmod +x ResumeGenerator-*-linux.AppImage
```

---

## Troubleshooting

### All Platforms

- **App won't start**: Check that you have sufficient permissions and disk space
- **Performance issues**: Close other applications to free up memory
- **Data not saving**: Ensure you have write permissions in your user directory

### Windows Specific

- **SmartScreen blocking**: Follow the Windows Security Warning steps above
- **Antivirus blocking**: Add the executable to your antivirus exclusions
- **DLL errors**: Install Visual C++ Redistributable 2019 or later

### macOS Specific

- **"App is damaged"**: Use the `xattr -cr` command to remove quarantine attributes
- **Permission denied**: Check that the app is in your Applications folder
- **Rosetta prompt on M1**: The app is universal, no Rosetta needed

### Linux Specific

- **Won't execute**: Ensure the AppImage has execute permissions (`chmod +x`)
- **Missing libraries**: Install `fuse2` for older systems: `sudo apt install fuse`
- **Display issues**: Try running with `--no-sandbox` flag

---

## Why Unsigned Apps?

We distribute unsigned applications to:

- **Avoid expensive code signing certificates** and pass savings to users
- **Enable immediate downloads** without approval processes
- **Maintain full compatibility** across all operating systems
- **Keep the app completely free** without subscription costs

The trade-off is the security warnings you see on first launch. The app is completely safe - these warnings are just because we haven't purchased expensive certificates from Apple/Microsoft.

---

## Support

If you encounter issues:

1. Check this troubleshooting guide first
2. Search [existing issues](../../issues)
3. Create a [new issue](../../issues/new) with:
   - Your operating system and version
   - Error messages (if any)
   - Steps to reproduce the problem

---

**Enjoy creating professional resumes with Resume Generator!** ✨
