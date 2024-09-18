use std::fs;
use std::fs::File;
use std::io::Read;
use std::io::Write;
use std::io;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

use octocrab::Octocrab;
use reqwest::Client;
use indicatif::ProgressBar;
use shlex::Shlex;
use zip::read::ZipArchive;

#[tauri::command]
fn external_command(cmd: String, args: String) {

    let args = args.replace("\\", "/");
    let lex = Shlex::new(&args);
    let args = lex.collect::<Vec<_>>();

    let _child = Command::new("cmd.exe")
        .arg("/C")
        .arg("start")
        .arg(cmd)
        .args(args)
        .spawn()
        .expect("Failed to spawn child process");
}

#[tauri::command]
async fn download_llama_cpp(install_dir: String) -> String {
    // latest の URL を組み立て
    // let latest_tag = get_latest_release_tag(String::from("ggerganov"), String::from("llama.cpp")).await;
    // 最新(b3772)で動かないので、暫定
    let latest_tag = String::from("b3727");
    let latest_llama_url = "https://github.com/ggerganov/llama.cpp/releases/download/{{VERSION}}/cudart-llama-bin-win-cu12.2.0-x64.zip".replace("{{VERSION}}", &latest_tag);
    let latest_cuda_url = "https://github.com/ggerganov/llama.cpp/releases/download/{{VERSION}}/llama-{{VERSION}}-bin-win-cuda-cu12.2.0-x64.zip".replace("{{VERSION}}", &latest_tag);

    // GitHub さんに迷惑をかけないように直列にダウンロード
    let llama_zip_path = download_to(latest_llama_url, install_dir.clone()).await;
    let cuda_zip_path = download_to(latest_cuda_url, install_dir.clone()).await;

    extract_zip(llama_zip_path, install_dir.clone()).await;
    extract_zip(cuda_zip_path, install_dir.clone()).await;

    let mut server_bin_path = PathBuf::from(install_dir);
    server_bin_path.push("llama-server.exe");

    (*server_bin_path.to_string_lossy()).to_string()
}

#[tauri::command]
async fn download_c3tr_model(install_dir: String, install_model: String) -> String {
    let download_url = "https://huggingface.co/webbigdata/C3TR-Adapter_gguf/resolve/main/{{MODEL_NAME}}?download=true".replace("{{MODEL_NAME}}", &install_model);

    // ファイルダウンロード
    download_to(download_url, install_dir).await
}

#[tauri::command]
async fn download_c3tr_client(install_dir: String) -> String {
    // latest の URL を組み立て
    let latest_tag = get_latest_release_tag(String::from("koron"), String::from("c3tr-client")).await;
    let latest_url = "https://github.com/koron/c3tr-client/releases/download/{{VERSION}}/c3tr-client_{{VERSION}}_windows_amd64.zip".replace("{{VERSION}}", &latest_tag);

    // ファイルダウンロード
    let download_file = download_to(latest_url, install_dir.to_string()).await;

    let install_file = extract_file_from_zip(install_dir, download_file.clone(), String::from("c3tr-client.exe")).await;

    fs::remove_file(download_file).unwrap();

    install_file
}

async fn extract_file_from_zip(install_dir:String, zip_path: String, target_file_name: String) -> String {
    // ZIPファイルを開く
    let file = File::open(zip_path).unwrap();
    let mut archive = ZipArchive::new(file).unwrap();

    // 指定したファイルを探す
    let mut extracted_file = None;
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        if file.name().ends_with(&target_file_name) {
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer).unwrap();
            extracted_file = Some(buffer);
            break;
        }
    }

    // ファイルが見つかったら保存
    if let Some(buffer) = extracted_file {
        let mut output_file_path = PathBuf::from(install_dir.clone());
        output_file_path.push(&target_file_name);
        let mut output_file = File::create(&output_file_path).unwrap();
        output_file.write(&buffer).unwrap();

        let output_file_path_string = (*output_file_path.to_string_lossy()).to_string();
        return output_file_path_string;
    } else {
        return String::from("");
    }
}

async fn download_to(from: String, to: String) -> String {
    use tokio::io::AsyncWriteExt;
    use tokio::fs::File;
    use futures_util::StreamExt;

    let client = Client::new();
    let response = client.get(&from).send().await.unwrap();

    let total_size = response.content_length().unwrap();

    let pb = ProgressBar::new(total_size);

    let file_name = from.split("/").last().unwrap();
    let file_name = file_name.split("?").next().unwrap();
    let mut out_file_path = PathBuf::from(&to);
    out_file_path.push(file_name);
    let mut out_file = File::create(&out_file_path).await.unwrap();

    let mut stream = response.bytes_stream();
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.unwrap();
        out_file.write_all(&chunk).await.unwrap();
        pb.inc(chunk.len() as u64);
    }

    (*out_file_path.to_string_lossy()).to_string()
}

async fn get_latest_release_tag(owner: String, repo: String) -> String {
    // 最新リリースを取得
    let octocrab = Octocrab::builder().build().unwrap();
    let release = octocrab.repos(owner, repo)
        .releases()
        .get_latest()
        .await
        .unwrap();
    release.tag_name.to_string()
}

async fn extract_zip(zip_path: String, output_dir: String) {
    let file = File::open(zip_path).unwrap();               // ZIPファイルを開く
    let mut archive = ZipArchive::new(file).unwrap();       // ZIPアーカイブを作成

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();        // 各エントリを取得
        let outpath = Path::new(&output_dir).join(file.name()); // 出力先パスを構成

        // ディレクトリなら作成し、ファイルなら書き込む
        if file.is_dir() {
            fs::create_dir_all(&outpath).unwrap();          // ディレクトリを作成
        } else {
            if let Some(parent) = outpath.parent() {
                fs::create_dir_all(parent).unwrap();        // 必要なら親ディレクトリを作成
            }
            let mut outfile = File::create(&outpath).unwrap();  // ファイルを作成
            io::copy(&mut file, &mut outfile).unwrap();         // 内容をコピー
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            external_command,
            download_c3tr_client,
            download_c3tr_model,
            download_llama_cpp
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

