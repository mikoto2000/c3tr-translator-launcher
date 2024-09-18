import { useEffect, useState } from "react";

import { Store } from '@tauri-apps/plugin-store'
import { open } from '@tauri-apps/plugin-dialog';

import "./App.css";
import { Button, CssBaseline, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { ModelDownloader } from "./downloader/ModelDownloader";
import { C3trClientDownloader } from "./downloader/C3trClientDownloader";
import { ServerDownloader } from "./downloader/ServerDownloader";

function App() {

  const SERVER_ARGS_DEFAULT = "--log-disable -ngl 43";
  const CLIENT_ARGS_DEFAULT = "";

  const config = new Store("config.dat");

  const [llamaServerPath, setLlamaServerPath] = useState<string>("llama-server");
  const [llamaServerArgs, setLlamaServerArgs] = useState<string>(SERVER_ARGS_DEFAULT);
  const [llamaServerModelPath, setLlamaServerModelPath] = useState<string>("");
  const [llamaClientPath, setLlamaClientPath] = useState<string>("c3tr-client");
  const [llamaClientArgs, setLlamaClientArgs] = useState<string>(CLIENT_ARGS_DEFAULT);


  useEffect(() => {

    (async () => {
      const lLlamaServerPath = await config.get<string>('llamaServerPath');
      if (lLlamaServerPath) {
        setLlamaServerPath(lLlamaServerPath);
      }
      const lLlamaServerArgs = await config.get<string>('llamaServerArgs');
      if (lLlamaServerArgs) {
        setLlamaServerArgs(lLlamaServerArgs);
      }
      const lLlamaServerModelPath = await config.get<string>('llamaServerModelPath');
      if (lLlamaServerModelPath) {
        setLlamaServerModelPath(lLlamaServerModelPath);
      }
      const lLlamaClientPath = await config.get<string>('llamaClientPath');
      if (lLlamaClientPath) {
        setLlamaClientPath(lLlamaClientPath);
      }
      const lLlamaClientArgs = await config.get<string>('llamaClientArgs');
      if (lLlamaClientArgs) {
        setLlamaClientArgs(lLlamaClientArgs);
      }

      listen("model_progress", (event) => {
        const current = (event.payload as any)[0];
        const total = (event.payload as any)[1];
        console.log(`${current}/${total}`);
      });
    })()

  }, []);

  return (
    <div className="container">
      <CssBaseline />

      <Typography align="left">ランチャー:</Typography>

      <Typography align="left">Server:</Typography>
      <div>
        <TextField
          label="llama server path"
          onChange={(event) => {
            const newValue = event.currentTarget.value;
            setLlamaServerPath(newValue);
            config.set('llamaServerPath', newValue);
          }}
          value={llamaServerPath}
          fullWidth
        />
        <Button
          onClick={async () => {
            const filePath = await open({});
            if (filePath) {
              setLlamaServerPath(filePath);
              config.set('llamaServerPath', filePath);
            }
          }}
          fullWidth
        >
          サーバー実行ファイル選択
        </Button>
        <TextField
          label="model"
          onChange={(event) => {
            const newValue = event.currentTarget.value;
            setLlamaServerModelPath(newValue);
            config.set('llamaServerModelPath', newValue);
          }}
          value={llamaServerModelPath}
          fullWidth
        />
        <Button
          onClick={async () => {
            const filePath = await open({});
            if (filePath) {
              setLlamaServerModelPath(filePath);
              config.set('llamaServerModelPath', filePath);
            }
          }}
          fullWidth
        >
          モデルファイル選択
        </Button>
        <TextField
          label="server argument"
          onChange={(event) => {
            const newValue = event.currentTarget.value;
            setLlamaServerArgs(newValue);
            config.set('llamaServerArgs', newValue);
          }}
          value={llamaServerArgs}
          fullWidth
        />
        <Button
          onClick={async () => {
            await invoke(
              "external_command",
              {
                cmd: llamaServerPath,
                args: "-m " + llamaServerModelPath + " " + llamaServerArgs
              });
          }}
        >
          実行
        </Button>
      </div>

      <Typography align="left">Client:</Typography>
      <div>
        <TextField
          label="llama client path"
          onChange={(event) => {
            const newValue = event.currentTarget.value;
            setLlamaClientPath(newValue);
            config.set('llamaClientPath', newValue);
          }}
          value={llamaClientPath}
          fullWidth
        />
        <Button
          onClick={async () => {
            const filePath = await open({});
            if (filePath) {
              setLlamaClientPath(filePath);
              config.set('llamaClientPath', filePath);
            }
          }}
          fullWidth
        >
          クライアントファイル選択
        </Button>
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
      </div>
      <Typography align="left">ダウンローダー:</Typography>
      <ServerDownloader
        setLlamaServerPath={setLlamaServerPath}
      />
      <ModelDownloader
        setLlamaServerModelPath={setLlamaServerModelPath}
      />
      <C3trClientDownloader
        setLlamaClientPath={setLlamaClientPath}
      />
    </div>
  );
}

export default App;
