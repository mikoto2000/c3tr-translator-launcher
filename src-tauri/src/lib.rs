use std::fs;
use std::fs::File;
use std::io::Read;
use std::io::Write;
use std::io;
use std::path::PathBuf;
use std::process::Command;

use octocrab::Octocrab;
use reqwest::get;
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
async fn download_c3tr_client(install_dir: String) -> String {
    // 最新リリースを取得
    let octocrab = Octocrab::builder().build().unwrap();
    let release = octocrab.repos("koron", "c3tr-client")
        .releases()
        .get_latest()
        .await
        .unwrap();

    // latest の URL を組み立て
    let latest_tag = release.tag_name.to_string();
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
        println!("ファイル {} を {} に保存しました。", target_file_name, install_dir);

        let output_file_path_string = (*output_file_path.to_string_lossy()).to_string();
        println!("{}", output_file_path_string);
        return output_file_path_string;
    } else {
        println!("ファイル {} が見つかりませんでした。", target_file_name);
        return String::from("");
    }
}

async fn download_to(from: String, to: String) -> String {
    let response = get(&from).await.unwrap();
    let content = response.bytes().await.unwrap();
    let file_name = from.split("/").last().unwrap();
    let mut out_file_path = PathBuf::from(&to);
    out_file_path.push(file_name);
    let mut out_file = File::create(&out_file_path).unwrap();
    io::copy(&mut content.as_ref(), &mut out_file).unwrap();
    (*out_file_path.to_string_lossy()).to_string()
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
            download_c3tr_client
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

