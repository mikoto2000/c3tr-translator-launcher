import { useEffect, useState } from "react";

import { Store } from '@tauri-apps/plugin-store'
import { open } from '@tauri-apps/plugin-dialog';

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { invoke } from "@tauri-apps/api/core";

type ServerLauncherProps = {
  llamaServerPath: string,
  setLlamaServerPath: (value: string) => void,
  llamaServerModelPath: string,
  setLlamaServerModelPath: (value: string) => void,
};

export const ServerLauncher: React.FC<ServerLauncherProps> = ({
  llamaServerPath,
  setLlamaServerPath,
  llamaServerModelPath,
  setLlamaServerModelPath
}) => {

  const config = new Store("config.dat");

  const SERVER_ARGS_DEFAULT = "--log-disable -ngl 43";
  const [llamaServerArgs, setLlamaServerArgs] = useState<string>(SERVER_ARGS_DEFAULT);

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
    })()

  }, []);
  return (
    <>
      <Typography align="left">Server:</Typography>
      <Stack sx={{ flexDirection: "column" }} spacing={2}>
        <Box sx={{ display: "flex" }}>
          <TextField
            label="llama server path"
            onChange={(event) => {
              const newValue = event.currentTarget.value;
              setLlamaServerPath(newValue);
              config.set('llamaServerPath', newValue);
            }}
            value={llamaServerPath}
            sx={{ flexGrow: 1 }}
          />
          <Button
            onClick={async () => {
              const filePath = await open({});
              if (filePath) {
                setLlamaServerPath(filePath);
                config.set('llamaServerPath', filePath);
              }
            }}
            sx={{ flexGrow: 0 }}
          >
            サーバー実行ファイル選択
          </Button>
        </Box>
        <Box sx={{ display: "flex" }}>
          <TextField
            label="model"
            onChange={(event) => {
              const newValue = event.currentTarget.value;
              setLlamaServerModelPath(newValue);
              config.set('llamaServerModelPath', newValue);
            }}
            value={llamaServerModelPath}
            sx={{ flexGrow: 1 }}
          />
          <Button
            onClick={async () => {
              const filePath = await open({});
              if (filePath) {
                setLlamaServerModelPath(filePath);
                config.set('llamaServerModelPath', filePath);
              }
            }}
            sx={{ flexGrow: 0 }}
          >
            モデルファイル選択
          </Button>
        </Box>
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
      </Stack>
    </>
  )
}

