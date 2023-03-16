const path = require("path");
const { app, session } = require("electron");
const isDev = require("electron-is-dev");
const UDPListener = require("./UDPListener.js");
const SelectionHandler = require("./SelectionHandler.js");
const MainWindow = require("./MainWindow");

let mainWindow;
let udpListener;
let selectionHandler;

async function createWindow() {
  mainWindow = new MainWindow();
  await mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
    await session.defaultSession.loadExtension(
      "C:\\Users\\ardro\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.27.2_0"
    );
    await session.defaultSession.loadExtension(
      "C:\\Users\\ardro\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\lmhkpmbekcpmknklioeibfkpmmfibljd\\3.0.19_0"
    );
  }
}

app.whenReady().then(() => {
  createWindow().then(() => {
    udpListener = new UDPListener(mainWindow);
    selectionHandler = new SelectionHandler();
  });
});

app.on("window-all-closed", () => app.quit());
