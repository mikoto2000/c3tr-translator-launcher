use std::process::Command;

use shlex::Shlex;

// TODO: args の処理
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![external_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

