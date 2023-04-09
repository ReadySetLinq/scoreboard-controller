#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{App, AppHandle, Manager, PhysicalPosition, PhysicalSize, Size, Wry};

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

#[tauri::command]
fn app_event(apphandle: AppHandle<Wry>, message: String) {
    std::thread::spawn(move || {
        // Send an emit_all with the event "app_event" and the payload "Hello Tauri!
        let emit_result = apphandle.emit_all("app::event", Payload { message });

        match emit_result {
            Ok(_) => {}
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    });
}

fn init(app: &App) {
    // Not entirely sure, but perhaps you could omit that error type
    let app_handle = app.handle();

    std::thread::spawn(move || {
        // Send an emit_all with the event "app_event" and the payload "Hello Tauri!
        let emit_result = app_handle.emit_all(
            "app::event",
            Payload {
                message: "Load Hello Tauri!".to_string(),
            },
        );

        match emit_result {
            Ok(_) => {}
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    });
}
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            init(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_window, app_event])
        .plugin(tauri_plugin_websocket::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
