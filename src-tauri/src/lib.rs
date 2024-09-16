use std::fs::File;
use std::io;
use std::path::PathBuf;
use std::process::Command;

use octocrab::Octocrab;
use reqwest::get;
use shlex::Shlex;

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
    println!("{}", latest_url);
    download_to(latest_url, install_dir).await
}

pub async fn download_to(from: String, to: String) -> String {
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

