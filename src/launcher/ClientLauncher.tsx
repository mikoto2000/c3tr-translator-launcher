import { useEffect, useState } from "react";

import { Store } from '@tauri-apps/plugin-store'
import { open } from '@tauri-apps/plugin-dialog';

import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import TabPanel, { a11yProps } from './TabPanel';
import { invoke } from "@tauri-apps/api/core";

type ClientLauncherProps = {
  llamaClientPath: string,
  setLlamaClientPath: (value: string) => void,
};

type WritingStyle =
  "casual"
  | "formal"
  | "technical"
  | "journalistic"
  | "web-fiction"
  | "business"
  | "nsfw"
  | "educational-casual"
  | "academic-presentation"
  | "slang"
  | "sns-casual"
  ;

export const ClientLauncher: React.FC<ClientLauncherProps> = ({
  llamaClientPath,
  setLlamaClientPath,
}) => {

  const config = new Store("config.dat");

  const [writingstyle, setWritingstyle] = useState<WritingStyle>("technical");

  useEffect(() => {

    (async () => {
      const lLlamaClientPath = await config.get<string>('llamaClientPath');
      if (lLlamaClientPath) {
        setLlamaClientPath(lLlamaClientPath);
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
        <FormControl fullWidth>
          <InputLabel>ダウンロードモデル選択</InputLabel>
          <Select
            value={writingstyle}
            onChange={(event) => {
              const newValue = event.target.value;
              if (newValue) {
                setWritingstyle(newValue as WritingStyle);
              }
            }}
          >
            <MenuItem value="casual">casual</MenuItem>
            <MenuItem value="formal">formal</MenuItem>
            <MenuItem value="technical">technical</MenuItem>
            <MenuItem value="journalistic">journalistic</MenuItem>
            <MenuItem value="web-fiction">web-fiction</MenuItem>
            <MenuItem value="business">business</MenuItem>
            <MenuItem value="nsfw">nsfw</MenuItem>
            <MenuItem value="educational-casual">educational-casual</MenuItem>
            <MenuItem value="academic-presentation">academic-presentation</MenuItem>
            <MenuItem value="slang">slang</MenuItem>
            <MenuItem value="sns-casual">sns-casual</MenuItem>
          </Select>
        </FormControl>
        <Button
          onClick={async () => {
            await invoke(
              "external_command",
              { cmd: llamaClientPath, args: `-writingstyle ${writingstyle} ` });
          }}
        >
          実行
        </Button>
      </Stack>
    </>
  )
}
