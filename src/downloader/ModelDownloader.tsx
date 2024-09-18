import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';

import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

type ModelDownloaderProps = {
  setLlamaServerModelPath: (installPath: string) => void,
};

export const ModelDownloader: React.FC<ModelDownloaderProps> = ({ setLlamaServerModelPath }) => {

  const [downloadModelName, setDownloadModelName] = useState<string>("C3TR-Adapter-IQ3_XXS.gguf");
  const [downloadedSize, setDownloadedSize] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);

  useEffect(() => {
    listen("model_progress", (event) => {
      const current = (event.payload as any)[0];
      const total = (event.payload as any)[1];
      console.log(`${current}/${total}`);
      setDownloadedSize(current);
      setTotalSize(total);
    });
  }, []);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel>ダウンロードモデル選択</InputLabel>
        <Select
          value={downloadModelName}
          onChange={(event) => {
            const newValue = event.target.value;
            if (newValue) {
              setDownloadModelName(newValue);
            }
          }}
        >
          <MenuItem value="C3TR-Adapter-IQ3_XXS.gguf">C3TR-Adapter-IQ3_XXS.gguf</MenuItem>
          <MenuItem value="C3TR-Adapter-Q3_k_m.gguf">C3TR-Adapter-Q3_k_m.gguf</MenuItem>
          <MenuItem value="C3TR-Adapter-Q4_k_m.gguf">C3TR-Adapter-Q4_k_m.gguf</MenuItem>
          <MenuItem value="C3TR-Adapter.f16.Q4_k_m.gguf">C3TR-Adapter.f16.Q4_k_m.gguf</MenuItem>
          <MenuItem value="C3TR-Adapter.f16.Q5_k_m.gguf">C3TR-Adapter.f16.Q5_k_m.gguf</MenuItem>
          <MenuItem value="C3TR-Adapter.f16.Q6_k.gguf">C3TR-Adapter.f16.Q6_k.gguf</MenuItem>
          <MenuItem value="C3TR-Adapter.f16.Q8_0.gguf">C3TR-Adapter.f16.Q8_0.gguf</MenuItem>
        </Select>
      </FormControl>
      <Button
        onClick={async () => {
          const dirPath = await open({ directory: true });
          if (dirPath) {
            const installPath: string = await invoke("download_c3tr_model", { installDir: dirPath, installModel: downloadModelName });
            console.log(installPath);
            setLlamaServerModelPath(installPath);
          }
        }}
        fullWidth
      >
        モデルファイルダウンロード
      </Button>
      モデルファイルダウンロード進捗: {`${downloadedSize} / ${totalSize}`}
    </>
  )
}
