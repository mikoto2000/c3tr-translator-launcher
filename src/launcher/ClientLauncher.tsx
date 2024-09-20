import { useEffect, useState } from "react";

import { Store } from '@tauri-apps/plugin-store'
import { open } from '@tauri-apps/plugin-dialog';

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import TabPanel, { a11yProps } from './TabPanel';
import { invoke } from "@tauri-apps/api/core";

type ClientLauncherProps = {
  llamaClientPath: string,
  setLlamaClientPath: (value: string) => void,
};

export const ClientLauncher: React.FC<ClientLauncherProps> = ({
  llamaClientPath,
  setLlamaClientPath,
}) => {

  const config = new Store("config.dat");

  const CLIENT_ARGS_DEFAULT = "";
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
    <>
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
    </>
  )
}
