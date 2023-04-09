#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, Size, Wry};

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[tauri::command]
fn set_window(apphandle: AppHandle<Wry>, width: u32, height: u32, x: u32, y: u32) {
    let window_opt = apphandle.get_window("main");
    match window_opt {
        Some(window) => {
            window
                .set_size(Size::Physical(PhysicalSize::new(width, height)))
                .expect("Could not resize!");

            window
                .set_position(PhysicalPosition::new(x, y))
                .expect("Could not move!");
        }
        None => {}
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| Ok(()))
        .invoke_handler(tauri::generate_handler![set_window])
        .plugin(tauri_plugin_websocket::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
