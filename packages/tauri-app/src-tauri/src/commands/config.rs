use keyring::Entry;
use serde::{Deserialize, Serialize};

/// Application configuration structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub server_domain: String,
    pub api_token: String,
    pub llm_endpoint: String,
    pub milvus_config: MilvusConfig,
    pub preferences: UserPreferences,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MilvusConfig {
    pub host: String,
    pub port: u16,
    pub collection: String,
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPreferences {
    pub theme: String,
    pub auto_confirm_api: bool,
    pub max_tokens: u32,
    pub language: String,
}

/// Save encrypted configuration to system keyring
#[tauri::command]
pub fn save_encrypted_config(config: AppConfig) -> Result<(), String> {
    let entry = Entry::new("universalai-agent", "config")
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    let config_json = serde_json::to_string(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    entry.set_password(&config_json)
        .map_err(|e| format!("Failed to save config to keyring: {}", e))?;

    println!("✅ Configuration saved successfully");
    Ok(())
}

/// Load encrypted configuration from system keyring
#[tauri::command]
pub fn load_encrypted_config() -> Result<AppConfig, String> {
    let entry = Entry::new("universalai-agent", "config")
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    let config_json = entry.get_password()
        .map_err(|e| format!("Failed to load config from keyring: {}", e))?;

    let config: AppConfig = serde_json::from_str(&config_json)
        .map_err(|e| format!("Failed to parse config: {}", e))?;

    println!("✅ Configuration loaded successfully");
    Ok(config)
}

/// Delete encrypted configuration from system keyring
#[tauri::command]
pub fn delete_encrypted_config() -> Result<(), String> {
    let entry = Entry::new("universalai-agent", "config")
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    entry.delete_credential()
        .map_err(|e| format!("Failed to delete config from keyring: {}", e))?;

    println!("✅ Configuration deleted successfully");
    Ok(())
}

/// Check if configuration exists
#[tauri::command]
pub fn has_config() -> Result<bool, String> {
    let entry = Entry::new("universalai-agent", "config")
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    match entry.get_password() {
        Ok(_) => Ok(true),
        Err(keyring::Error::NoEntry) => Ok(false),
        Err(e) => Err(format!("Failed to check config: {}", e)),
    }
}

/// Get default configuration
#[tauri::command]
pub fn get_default_config() -> Result<AppConfig, String> {
    Ok(AppConfig {
        server_domain: String::new(),
        api_token: String::new(),
        llm_endpoint: String::new(),
        milvus_config: MilvusConfig {
            host: "localhost".to_string(),
            port: 19530,
            collection: "api_definitions".to_string(),
            username: None,
            password: None,
        },
        preferences: UserPreferences {
            theme: "light".to_string(),
            auto_confirm_api: false,
            max_tokens: 2000,
            language: "zh-CN".to_string(),
        },
    })
}
