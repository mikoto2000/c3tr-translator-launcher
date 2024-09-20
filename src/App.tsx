import { useEffect, useState } from "react";

import { Store } from '@tauri-apps/plugin-store'
import { open } from '@tauri-apps/plugin-dialog';

import "./App.css";
import { Box, Button, CssBaseline, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import TabPanel, { a11yProps } from './TabPanel';
import { invoke } from "@tauri-apps/api/core";
import { ModelDownloader } from "./downloader/ModelDownloader";
import { C3trClientDownloader } from "./downloader/C3trClientDownloader";
import { ServerDownloader } from "./downloader/ServerDownloader";
import { ServerLauncher } from "./ServerLauncher";

function App() {

  const CLIENT_ARGS_DEFAULT = "";

  const config = new Store("config.dat");

  const [tabIndex, setTabIndex] = useState<number>(0);

  const [llamaServerPath, setLlamaServerPath] = useState<string>("llama-server");
  const [llamaServerModelPath, setLlamaServerModelPath] = useState<string>("");
  const [llamaClientPath, setLlamaClientPath] = useState<string>("c3tr-client");
  const [llamaClientArgs, setLlamaClientArgs] = useState<string>(CLIENT_ARGS_DEFAULT);


  useEffect(() => {

    (async () => {
      const lLlamaClientPath = await config.get<string>('llamaClientPath');
      if (lLlamaClientPath) {
        setLlamaClientPath(lLlamaClientPath);
      }
      const lLlamaClientArgs = await config.get<string>('llamaClientArgs');
      if (lLlamaClientArgs) {
        setLlamaClientArgs(lLlamaClientArgs);
      }
    })()

  }, []);

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

        <Typography align="left">Client:</Typography>
        <Stack sx={{ flexDirection: "column" }} spacing={2}>
          <Box sx={{ display: "flex" }}>
            <TextField
              label="llama client path"
              onChange={(event) => {
                const newValue = event.currentTarget.value;
                setLlamaClientPath(newValue);
                config.set('llamaClientPath', newValue);
              }}
              value={llamaClientPath}
              sx={{ flexGrow: 1 }}
            />
            <Button
              onClick={async () => {
                const filePath = await open({});
                if (filePath) {
                  setLlamaClientPath(filePath);
                  config.set('llamaClientPath', filePath);
                }
              }}
              sx={{ flexGrow: 0 }}
            >
              クライアントファイル選択
            </Button>
          </Box>
          <TextField
            placeholder="client argument"
            onChange={(event) => {
              const newValue = event.currentTarget.value;
              setLlamaClientArgs(newValue);
            }}
            value={llamaClientArgs}
            fullWidth
          />
          <Button
            onClick={async () => {
              await invoke(
                "external_command",
                { cmd: llamaClientPath, args: llamaClientArgs });
            }}
          >
            実行
          </Button>
        </Stack>
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
