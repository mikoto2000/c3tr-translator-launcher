import { useState } from "react";

import { open } from '@tauri-apps/plugin-dialog';

import "./App.css";
import { Button, CssBaseline, TextField, Typography } from "@mui/material";

function App() {

  const SERVER_ARGS_DEFAULT = "--log-disable -ngl 43";
  const CLIENT_ARGS_DEFAULT = "";

  const [llamaServerPath, setLlamaServerPath] = useState<string>("llama-server");
  const [llamaServerArgs, setLlamaServerArgs] = useState<string>(SERVER_ARGS_DEFAULT);
  const [llamaClientPath, setLlamaClientPath] = useState<string>("c3tr-client");
  const [llamaClientArgs, setLlamaClientArgs] = useState<string>(CLIENT_ARGS_DEFAULT);

  return (
    <div className="container">
      <CssBaseline />

      <Typography>Server:</Typography>
      <div>
        <TextField
          placeholder="llama server path"
          value={llamaServerPath}
          fullWidth
        />
        <TextField
          placeholder="server argument"
          value={llamaServerArgs}
          fullWidth
        />
        <Button
          onClick={async () => {
            const filePath = await open({});
            if (filePath) {
              setLlamaServerPath(filePath);
            }
          }}
        >
          ファイル選択
        </Button>
        <Button
          onClick={async () => {
          }}
        >
          実行
        </Button>
      </div>

      <Typography>Client:</Typography>
      <div>
        <TextField
          placeholder="llama client path"
          value={llamaClientPath}
          fullWidth
        />
        <TextField
          placeholder="server argument"
          value={llamaClientArgs}
          fullWidth
        />
        <Button
          onClick={async () => {
            const filePath = await open({});
            if (filePath) {
              setLlamaClientPath(filePath);
            }
          }}
        >
          ファイル選択
        </Button>
        <Button
          onClick={async () => {
          }}
        >
          実行
        </Button>
      </div>
    </div>
  );
}

export default App;
