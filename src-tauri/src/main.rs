#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, Size, Wry};

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
        .invoke_handler(tauri::generate_handler![set_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
