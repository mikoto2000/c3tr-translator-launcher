import { Button } from "@mui/material";

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from '@tauri-apps/plugin-dialog';
import { useEffect, useState } from "react";

type ServerDownloaderProps = {
  setLlamaServerPath: (llamaServerPath: string) => void,
};

export const ServerDownloader: React.FC<ServerDownloaderProps> = ({ setLlamaServerPath }) => {

  const [downloadedSize, setDownloadedSize] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);

  useEffect(() => {
    listen("llama_zip_progress", (event) => {
      const current = (event.payload as any)[0];
      const total = (event.payload as any)[1];
      console.log(`${current}/${total}`);
      setDownloadedSize(current);
      setTotalSize(total);
    });
  }, []);

  return (
    <>
      <Button
        onClick={async () => {
          const dirPath = await open({ directory: true });
          if (dirPath) {
            const installPath: string = await invoke("download_llama_cpp", { installDir: dirPath });
            console.log(installPath);
            setLlamaServerPath(installPath);
          }
        }}
        fullWidth
      >
        サーバーファイルダウンロード †選択したディレクトリにファイル一式が展開されます
      </Button>
      サーバーファイルダウンロード進捗: {`${downloadedSize} / ${totalSize}`}
    </>
  )
}
