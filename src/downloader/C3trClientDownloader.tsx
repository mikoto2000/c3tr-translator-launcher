import { Button } from "@mui/material";

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from '@tauri-apps/plugin-dialog';
import { useEffect, useState } from "react";

type C3trClientDownloaderProps = {
  setLlamaClientPath: (llamaClientPath: string) => void,
};

export const C3trClientDownloader: React.FC<C3trClientDownloaderProps> = ({ setLlamaClientPath }) => {

  const [downloadedSize, setDownloadedSize] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);

  useEffect(() => {
    listen("c3tr_zip_progress", (event) => {
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
            const installPath: string = await invoke("download_c3tr_client", { installDir: dirPath });
            console.log(installPath);
            setLlamaClientPath(installPath);
          }
        }}
        fullWidth
      >
        クライアントファイルダウンロード
      </Button>
      クライアントファイルダウンロード進捗: {`${downloadedSize} / ${totalSize}`}
    </>
  )
}
