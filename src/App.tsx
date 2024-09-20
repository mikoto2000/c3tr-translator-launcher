import { useState } from "react";

import { Store } from '@tauri-apps/plugin-store'

import "./App.css";
import { CssBaseline, Stack, Tab, Tabs } from "@mui/material";
import TabPanel, { a11yProps } from './TabPanel';
import { ModelDownloader } from "./downloader/ModelDownloader";
import { C3trClientDownloader } from "./downloader/C3trClientDownloader";
import { ServerDownloader } from "./downloader/ServerDownloader";
import { ServerLauncher } from "./launcher/ServerLauncher";
import { ClientLauncher } from "./launcher/ClientLauncher";

function App() {


  const config = new Store("config.dat");

  const [tabIndex, setTabIndex] = useState<number>(0);

  const [llamaServerPath, setLlamaServerPath] = useState<string>("llama-server");
  const [llamaServerModelPath, setLlamaServerModelPath] = useState<string>("");
  const [llamaClientPath, setLlamaClientPath] = useState<string>("c3tr-client");



  return (
    <div>
      <CssBaseline />
      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => {
          setTabIndex(newValue);
        }}
        variant='fullWidth'
      >
        <Tab label="ランチャー" {...a11yProps(0)} />
        <Tab label="ダウンローダー" {...a11yProps(1)} />

      </Tabs>
      <TabPanel
        value={tabIndex}
        index={0}
      >
        <ServerLauncher
          llamaServerPath={llamaServerPath}
          setLlamaServerPath={setLlamaServerPath}
          llamaServerModelPath={llamaServerModelPath}
          setLlamaServerModelPath={setLlamaServerModelPath}
        />
        <ClientLauncher
          llamaClientPath={llamaClientPath}
          setLlamaClientPath={setLlamaClientPath}
        />

      </TabPanel>
      <TabPanel
        value={tabIndex}
        index={1}
      >
        <Stack sx={{ flexDirection: "column" }} spacing={2}>
          <ServerDownloader
            setLlamaServerPath={setLlamaServerPath}
          />
          <ModelDownloader
            setLlamaServerModelPath={setLlamaServerModelPath}
          />
          <C3trClientDownloader
            setLlamaClientPath={setLlamaClientPath}
          />
        </Stack>
      </TabPanel>
    </div >
  );
}

export default App;
