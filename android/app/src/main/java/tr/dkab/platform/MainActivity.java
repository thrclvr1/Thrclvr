package tr.dkab.platform;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import org.json.JSONObject;

import java.io.OutputStream;
import java.util.Collections;

/**
 * Din Kültürü platformunu (assets/index.html) tam ekran bir WebView içinde açar.
 *
 * Sayfa sabit bir https kökenden sunulur (https://appassets.androidplatform.net/assets/index.html).
 * Böylece localStorage / sessionStorage verileri (dk2, öğretmen kayıtları, dk-ogretmen-pin ...)
 * uygulama güncellense de aynı kökende kalır.
 */
public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String ORIGIN = "https://" + HOST;
    private static final String START_URL = ORIGIN + "/assets/index.html";

    private static final int REQ_FILE_CHOOSER = 1;
    private static final int REQ_SAVE_FILE = 2;

    /** Sayfadaki "JSON olarak yedekle" gibi blob indirmelerini Android'e iletir. */
    private static final String DOWNLOAD_HOOK =
            "(function(){if(window.__dkAndroidDl||!window.DKAndroid)return;window.__dkAndroidDl=1;"
            + "var oc=HTMLAnchorElement.prototype.click;"
            + "HTMLAnchorElement.prototype.click=function(){var h=this.href||'';"
            + "if(this.hasAttribute('download')&&(h.indexOf('blob:')===0||h.indexOf('data:')===0)){"
            + "var n=this.getAttribute('download')||'dosya';"
            + "fetch(h).then(function(r){return r.blob()}).then(function(b){return new Promise(function(ok,no){"
            + "var fr=new FileReader();fr.onload=function(){ok(fr.result)};fr.onerror=no;fr.readAsDataURL(b)})})"
            + ".then(function(d){DKAndroid.postMessage(JSON.stringify({tur:'kaydet',ad:n,veri:d}))})"
            + ".catch(function(e){console.error('İndirme başarısız',e)});return;}"
            + "return oc.apply(this,arguments)};})();";

    private FrameLayout root;
    private WebView web;
    private WebViewAssetLoader assetLoader;

    private ValueCallback<Uri[]> fileCallback;
    private byte[] pendingSaveBytes;

    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#0B1020"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0B1020"));
        root.addView(web, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);
        applySystemBarInsets();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportMultipleWindows(false); // target="_blank" bağlantıları aşağıda dış tarayıcıya yönlenir
        s.setSupportZoom(false);

        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain(HOST)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (HOST.equals(u.getHost())) return false;
                if (!request.isForMainFrame()) return false; // YouTube gibi gömülü içerikler sayfada kalır
                openExternal(u);
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                view.evaluateJavascript(DOWNLOAD_HOOK, null);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*"); // bazı dosya yöneticileri .json'u application/json olarak tanımıyor
                try {
                    startActivityForResult(Intent.createChooser(i, "Yedek dosyasını seç"), REQ_FILE_CHOOSER);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    toast("Dosya seçici bulunamadı.");
                    return false;
                }
                return true;
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) { callback.onCustomViewHidden(); return; }
                customView = view;
                customViewCallback = callback;
                root.addView(view, new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                web.setVisibility(View.GONE);
            }

            @Override
            public void onHideCustomView() {
                hideCustomView();
            }
        });

        web.setDownloadListener((url, ua, cd, mime, len) -> {
            if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                openExternal(Uri.parse(url));
            }
        });

        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            // Köprü yalnızca uygulamanın kendi kökenine açılır; gömülü YouTube çerçeveleri erişemez.
            WebViewCompat.addWebMessageListener(web, "DKAndroid", Collections.singleton(ORIGIN),
                    (view, message, sourceOrigin, isMainFrame, replyProxy) -> {
                        if (isMainFrame) handleBridgeMessage(message.getData());
                    });
        }

        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null) {
            web.loadUrl(START_URL);
        }
    }

    /** Android 15+ kenardan kenara çizimde içerik durum çubuğu / gezinme çubuğu altında kalmasın. */
    private void applySystemBarInsets() {
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int l, t, r, b;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                android.graphics.Insets bars = insets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                android.graphics.Insets ime = insets.getInsets(WindowInsets.Type.ime());
                l = bars.left; t = bars.top; r = bars.right; b = Math.max(bars.bottom, ime.bottom);
            } else {
                l = insets.getSystemWindowInsetLeft(); t = insets.getSystemWindowInsetTop();
                r = insets.getSystemWindowInsetRight(); b = insets.getSystemWindowInsetBottom();
            }
            if (customView != null) { l = t = r = b = 0; }
            v.setPadding(l, t, r, b);
            return insets;
        });
    }

    private void handleBridgeMessage(String data) {
        if (data == null) return;
        try {
            JSONObject o = new JSONObject(data);
            if (!"kaydet".equals(o.optString("tur"))) return;
            String ad = o.optString("ad", "dosya");
            String veri = o.optString("veri", "");
            int virgul = veri.indexOf(',');
            if (!veri.startsWith("data:") || virgul < 0) return;
            String baslik = veri.substring(5, virgul);
            String mime = baslik.split(";")[0];
            if (mime.isEmpty()) mime = "application/octet-stream";
            String govde = veri.substring(virgul + 1);
            pendingSaveBytes = baslik.contains(";base64")
                    ? Base64.decode(govde, Base64.DEFAULT)
                    : Uri.decode(govde).getBytes("UTF-8");

            Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);
            i.setType(mime);
            i.putExtra(Intent.EXTRA_TITLE, ad);
            startActivityForResult(i, REQ_SAVE_FILE);
        } catch (Exception e) {
            pendingSaveBytes = null;
            toast("Dosya kaydedilemedi.");
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE_CHOOSER) {
            if (fileCallback != null) {
                Uri u = (resultCode == RESULT_OK && data != null) ? data.getData() : null;
                fileCallback.onReceiveValue(u != null ? new Uri[]{u} : null);
                fileCallback = null;
            }
        } else if (requestCode == REQ_SAVE_FILE) {
            byte[] bytes = pendingSaveBytes;
            pendingSaveBytes = null;
            if (resultCode != RESULT_OK || data == null || data.getData() == null || bytes == null) return;
            try (OutputStream os = getContentResolver().openOutputStream(data.getData())) {
                if (os == null) throw new java.io.IOException("akış yok");
                os.write(bytes);
                toast("Dosya kaydedildi.");
            } catch (Exception e) {
                toast("Dosya kaydedilemedi.");
            }
        }
    }

    private void openExternal(Uri u) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u));
        } catch (ActivityNotFoundException e) {
            toast("Bu bağlantıyı açacak uygulama bulunamadı.");
        }
    }

    private void hideCustomView() {
        if (customView == null) return;
        root.removeView(customView);
        customView = null;
        web.setVisibility(View.VISIBLE);
        if (customViewCallback != null) customViewCallback.onCustomViewHidden();
        customViewCallback = null;
        root.requestApplyInsets();
    }

    private void toast(String m) {
        Toast.makeText(this, m, Toast.LENGTH_SHORT).show();
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (customView != null) { hideCustomView(); return; }
        // Uygulama sayfa geçişlerini ve açılır pencereleri history.pushState ile kaydediyor.
        if (web.canGoBack()) { web.goBack(); return; }
        super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            root.removeView(web);
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
