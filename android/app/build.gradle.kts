import java.util.Properties

plugins {
    id("com.android.application")
}

// Uygulamanın kendisi: deponun kökündeki index.html (güncel sürüm).
val webIndex = rootProject.file("../index.html")

// Sürüm numarası index.html içindeki V31.VER="VXX.Y" değerinden okunur.
val surum: Pair<Int, String> = run {
    val m = Regex("""V31\.VER="V(\d+)\.(\d+)"""").find(webIndex.readText(Charsets.UTF_8))
        ?: error("index.html içinde V31.VER bulunamadı")
    val (ana, alt) = m.destructured
    Pair(ana.toInt() * 100 + alt.toInt(), "$ana.$alt")
}

// İmza bilgisi depoya konmaz: android/keystore.properties (git'e eklenmez) veya ortam değişkenleri.
val imza = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
fun imzaDegeri(anahtar: String, ortam: String): String? = imza.getProperty(anahtar) ?: System.getenv(ortam)

abstract class WebVarliklariniKopyala : DefaultTask() {
    @get:InputFile abstract val kaynak: RegularFileProperty
    @get:OutputDirectory abstract val hedef: DirectoryProperty
    @TaskAction fun calistir() {
        val d = hedef.get().asFile
        d.deleteRecursively(); d.mkdirs()
        kaynak.get().asFile.copyTo(d.resolve("index.html"))
    }
}
val webKopyala = tasks.register<WebVarliklariniKopyala>("webVarliklariniKopyala") {
    kaynak.set(webIndex)
}

android {
    namespace = "tr.dkab.platform"
    compileSdk = 35

    defaultConfig {
        applicationId = "tr.dkab.platform"
        minSdk = 24
        targetSdk = 35
        versionCode = surum.first
        versionName = surum.second
    }

    signingConfigs {
        create("surum") {
            val dosya = imzaDegeri("storeFile", "DK_KEYSTORE")
            if (dosya != null) {
                storeFile = rootProject.file(dosya)
                storePassword = imzaDegeri("storePassword", "DK_KEYSTORE_PASSWORD")
                keyAlias = imzaDegeri("keyAlias", "DK_KEY_ALIAS")
                keyPassword = imzaDegeri("keyPassword", "DK_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            if (imzaDegeri("storeFile", "DK_KEYSTORE") != null) {
                signingConfig = signingConfigs.getByName("surum")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // 12 MB'lık HTML sıkıştırılmadan değil, sıkıştırılarak paketlensin (APK boyutu).
    androidResources {
        noCompress.clear()
    }
}

androidComponents {
    onVariants { variant ->
        variant.sources.assets?.addGeneratedSourceDirectory(webKopyala, WebVarliklariniKopyala::hedef)
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
