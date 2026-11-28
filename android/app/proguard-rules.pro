# V60: R8 kod küçültme — temkinli koruma kuralları.
# Uygulamanın kendi kodu (WebView köprüsü, yedek, hesap seçici) olduğu gibi kalır.
-keep class tr.dkab.platform.** { *; }
# WebView uyumluluk kitaplığı: WebView sağlayıcısıyla ad/yansıma üzerinden konuşur.
-keep class androidx.webkit.** { *; }
-keep class org.chromium.support_lib_boundary.** { *; }
# Google ile giriş (Credential Manager): sağlayıcı sınıfları adla yüklenir.
-keep class androidx.credentials.** { *; }
-keep class com.google.android.libraries.identity.googleid.** { *; }
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-dontwarn org.chromium.**
