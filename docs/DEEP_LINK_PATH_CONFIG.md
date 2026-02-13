# 深層連結配置說明

## 📍 `/dataUrl=gotabichoShareKey` 是什麼？

這個路徑**不是在 app.json 中設定**的，而是在原生程式碼中動態產生的。

## 🔧 路徑產生的位置

### 原本的設定（已修改）

**檔案**：`ios/ShareExtension/ShareViewController.swift`

**修改前（Line 481）**：

```swift
let url = URL(string: "\(shareProtocol)://dataUrl=\(sharedKey)#\(type)")!
```

其中：

- `shareProtocol` = `"gotabicho"` （定義在 Line 16）
- `sharedKey` = `"gotabichoShareKey"` （定義在 Line 17）
- `type` = `media`/`text`/`weburl`/`file` （根據分享類型）

所以原本會產生：

```
gotabicho://dataUrl=gotabichoShareKey#media
```

### 修改後（目前）

**檔案**：`ios/ShareExtension/ShareViewController.swift` (Line 483)

```swift
let url = URL(string: "\(shareProtocol)://")!
```

現在產生：

```
gotabicho://
```

## 🎯 為什麼要改？

### 問題：

當使用 `gotabicho://dataUrl=gotabichoShareKey#media` 時：

1. Expo Router 會嘗試解析路徑 `/dataUrl=gotabichoShareKey`
2. 這個路由不存在
3. 用戶看到「找不到頁面」錯誤

### 解決方案：

使用簡單的 `gotabicho://`：

1. 直接開啟 App 到首頁
2. 不會觸發路由解析
3. `expo-share-intent` 從 UserDefaults 讀取資料
4. App 正常導航到新增收據頁面

## ⚙️ 如果你想自訂路徑

### 方案 1：在 app.json 中設定（不推薦）

```json
{
  "expo": {
    "scheme": "gotabicho",
    "extra": {
      "router": {
        "initialRouteName": "index"
      }
    }
  }
}
```

但這**不會改變** Share Extension 產生的 URL。

### 方案 2：修改 ShareViewController.swift（目前方案）

如果你想要特定路徑，可以改成：

```swift
// 方案 A: 直接導向特定頁面
let url = URL(string: "\(shareProtocol)://add-receipt")!

// 方案 B: 導向首頁（目前使用）
let url = URL(string: "\(shareProtocol)://")!

// 方案 C: 帶參數（不推薦，會有路由問題）
let url = URL(string: "\(shareProtocol)://add-receipt?source=share")!
```

### 方案 3：使用萬用路由

在 `app/+not-found.tsx` 中處理所有未匹配的路徑（已實作）。

## 📋 目前的設定總覽

### app.json

```json
{
  "scheme": "gotabicho",  // ← 這是基礎 URL scheme
  "plugins": [
    ["expo-share-intent", {
      "iosActivationRules": {
        "NSExtensionActivationSupportsImageWithMaxCount": 5
        // ... 其他規則
      }
    }]
  ]
}
```

### ShareViewController.swift

```swift
let shareProtocol = "gotabicho"  // 使用 app.json 中的 scheme
let url = URL(string: "\(shareProtocol)://")!  // 產生 gotabicho://
```

### Expo Router

```
gotabicho:// → 導向 app/index.tsx (首頁)
```

### useShareIntentHandler

```typescript
// 自動從 UserDefaults 讀取分享資料
// 不依賴 URL 參數
```

## ✅ 建議配置（目前已實作）

保持目前的設定：

1. **app.json**：`"scheme": "gotabicho"`
2. **ShareViewController.swift**：`gotabicho://`（簡單 URL）
3. **app/+not-found.tsx**：捕捉任何未匹配的路徑
4. **useShareIntentHandler**：從 UserDefaults 讀取資料

這樣最穩定，不會有路由衝突問題。

## 🔄 如果你真的想改路徑

告訴我你想要什麼樣的路徑格式，例如：

- `gotabicho://share`
- `gotabicho://receipt/new`
- 其他自訂格式

我可以幫你修改 `ShareViewController.swift` 並確保 Expo Router 正確處理！

---

**結論**：`/dataUrl=gotabichoShareKey` 不是在 app.json 設定的，而是在原生 Swift 程式碼中產生。目前已經簡化為 `gotabicho://`
以避免路由問題。
