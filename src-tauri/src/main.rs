#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
fn set_window_size(width: i32, height: i32) -> String {
    format!("window size set to {}x{}!", width, height)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![set_window_size])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
