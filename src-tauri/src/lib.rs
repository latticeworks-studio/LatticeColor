use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

pub struct ScreenData(pub Mutex<Option<String>>);

// ── Screen capture ────────────────────────────────────────────────────────────

fn capture_jpeg_base64(cursor_x: f64, cursor_y: f64) -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};
    use image::codecs::jpeg::JpegEncoder;
    use std::io::Cursor;
    use xcap::Monitor;

    let monitors = Monitor::all().map_err(|e| e.to_string())?;

    // Find the monitor the cursor is on; fall back to the first monitor.
    let monitor = monitors
        .iter()
        .find(|m| {
            let mx = m.x() as f64;
            let my = m.y() as f64;
            cursor_x >= mx && cursor_x < mx + m.width() as f64
                && cursor_y >= my && cursor_y < my + m.height() as f64
        })
        .or_else(|| monitors.first())
        .ok_or("No monitor found")?;

    let img = monitor.capture_image().map_err(|e| e.to_string())?;
    let rgb = image::DynamicImage::ImageRgba8(img).to_rgb8();

    let mut jpeg: Vec<u8> = Vec::new();
    let mut encoder = JpegEncoder::new_with_quality(Cursor::new(&mut jpeg), 92);
    encoder.encode_image(&image::DynamicImage::ImageRgb8(rgb))
        .map_err(|e| e.to_string())?;

    Ok(general_purpose::STANDARD.encode(&jpeg))
}

// ── Tauri commands ────────────────────────────────────────────────────────────

// Hides the window, captures the monitor the cursor is currently on, re-shows.
#[tauri::command]
fn capture_screen(app: AppHandle) -> Result<String, String> {
    // Sample cursor position before hiding so we know which monitor to capture.
    let cursor = app.cursor_position().unwrap_or_default();
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.hide();
    }
    std::thread::sleep(std::time::Duration::from_millis(150));
    let b64 = capture_jpeg_base64(cursor.x, cursor.y)?;
    if let Some(win) = app.get_webview_window("main") {
        let _ = win.show();
    }
    Ok(b64)
}

#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_palette_png(app: AppHandle, base64_data: String, name: String) -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};
    let bytes = general_purpose::STANDARD
        .decode(&base64_data)
        .map_err(|e| e.to_string())?;
    let safe: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();
    let filename = format!("{}.png", if safe.is_empty() { "palette".to_string() } else { safe });
    let dir = app.path().download_dir().map_err(|e| e.to_string())?;
    let path = dir.join(&filename);
    std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

#[tauri::command]
fn reveal_in_explorer(path: String) -> Result<(), String> {
    std::process::Command::new("explorer")
        .arg(format!("/select,{}", path))
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_palette_md(app: AppHandle, content: String, name: String) -> Result<String, String> {
    let safe: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect();
    let filename = format!("{}.md", if safe.is_empty() { "palette".to_string() } else { safe });
    let dir = app.path().download_dir().map_err(|e| e.to_string())?;
    let path = dir.join(&filename);
    std::fs::write(&path, content.as_bytes()).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

// ── App setup ─────────────────────────────────────────────────────────────────

pub fn run() {
    tauri::Builder::default()
        .manage(ScreenData(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![capture_screen, open_url, save_palette_png, save_palette_md, reveal_in_explorer])
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();

            // Ctrl+Shift+C → tell the frontend to activate the eyedropper
            let shortcut = Shortcut::new(
                Some(Modifiers::CONTROL | Modifiers::SHIFT),
                Code::KeyC,
            );
            app.global_shortcut().on_shortcut(shortcut, move |_app, _sh, _event| {
                // Just emit — don't show/focus first, that causes a visible flash
                // before capture_screen hides the window again.
                // The webview receives events even while hidden.
                if let Some(win) = handle.get_webview_window("main") {
                    let _ = win.emit("activate-eyedropper", ());
                }
            })?;

            // System tray
            let handle2 = app.handle().clone();
            let quit = MenuItem::with_id(app, "quit", "Quit LatticeColor", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show / Hide", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("LatticeColor")
                .on_menu_event(move |_app, event| match event.id.as_ref() {
                    "quit" => std::process::exit(0),
                    "show" => toggle_main(&handle2),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        toggle_main(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running LatticeColor");
}

fn toggle_main(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}
