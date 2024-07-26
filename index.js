import { app, BrowserWindow, session, dialog } from "electron";
import Store from "electron-store";

const store = new Store();

function createWindow(proxy) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (proxy) {
    session.defaultSession.setProxy({ proxyRules: proxy }, () => {
      win.loadURL("https://www.soundcloud.com");
    });
  } else {
    win.loadURL("https://www.soundcloud.com");
  }
}

function promptForProxy() {
  return new Promise((resolve) => {
    const result = dialog.showMessageBoxSync({
      type: "question",
      buttons: ["OK", "Cancel"],
      title: "Proxy Configuration",
      message:
        "Please enter your SOCKS5 proxy URL (e.g., socks5://username:password@proxy-url:port):",
      detail: "",
      inputType: "input",
    });

    if (result.response === 0) {
      const proxyUrl = result.inputValue;
      resolve(proxyUrl);
    } else {
      resolve(null);
    }
  });
}

app.whenReady().then(async () => {
  let proxy = store.get("proxy");

  if (!proxy) {
    proxy = await promptForProxy();

    if (proxy) {
      store.set("proxy", proxy);
    }
  }

  createWindow(proxy);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(proxy);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
