package com.example

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.example.ui.theme.MyApplicationTheme
import org.json.JSONArray

class MainActivity : ComponentActivity() {

  private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

  private val fileChooserLauncher =
      registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (fileChooserCallback != null) {
          val clipData = result.data?.clipData
          val dataString = result.data?.dataString
          val results =
              when {
                clipData != null -> {
                  Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                }
                dataString != null -> arrayOf(Uri.parse(dataString))
                else -> null
              }
          fileChooserCallback?.onReceiveValue(results)
          fileChooserCallback = null
        }
      }

  fun launchFileChooser(callback: ValueCallback<Array<Uri>>?, acceptTypes: Array<String>?) {
    fileChooserCallback?.onReceiveValue(null)
    fileChooserCallback = callback

    val intent =
        Intent(Intent.ACTION_GET_CONTENT).apply {
          addCategory(Intent.CATEGORY_OPENABLE)
          type = "image/*"
          if (acceptTypes != null && acceptTypes.isNotEmpty()) {
            putExtra(Intent.EXTRA_MIME_TYPES, acceptTypes)
          }
          putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
        }
    fileChooserLauncher.launch(Intent.createChooser(intent, "Pilih Gambar"))
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        BoraScanApp(
            activity = this,
            onLaunchFileChooser = { cb, types -> launchFileChooser(cb, types) })
      }
    }
  }
}

class BoraScanJsInterface(private val context: Context) {
  @JavascriptInterface
  fun vibrate(patternJson: String) {
    try {
      val jsonArray = JSONArray(patternJson)
      val timings = LongArray(jsonArray.length())
      for (i in 0 until jsonArray.length()) {
        timings[i] = jsonArray.getLong(i)
      }

      val vibrator =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager =
                context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
          } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
          }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        if (timings.size == 1) {
          vibrator.vibrate(
              VibrationEffect.createOneShot(timings[0], VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
          vibrator.vibrate(VibrationEffect.createWaveform(timings, -1))
        }
      } else {
        @Suppress("DEPRECATION") vibrator.vibrate(timings, -1)
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun BoraScanApp(
    activity: ComponentActivity,
    onLaunchFileChooser: (ValueCallback<Array<Uri>>?, Array<String>?) -> Unit
) {
  val context = LocalContext.current
  var hasCameraPermission by remember {
    mutableStateOf(
        ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) ==
            PackageManager.PERMISSION_GRANTED)
  }

  val permissionLauncher =
      rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        hasCameraPermission = isGranted
      }

  LaunchedEffect(Unit) {
    if (!hasCameraPermission) {
      permissionLauncher.launch(Manifest.permission.CAMERA)
    }
  }

  var webViewInstance by remember { mutableStateOf<WebView?>(null) }

  BackHandler(enabled = webViewInstance?.canGoBack() == true) { webViewInstance?.goBack() }

  Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
    Box(modifier = Modifier.fillMaxSize().statusBarsPadding()) {
      AndroidView(
          modifier = Modifier.fillMaxSize(),
          factory = { ctx ->
            WebView(ctx).apply {
              settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                @Suppress("DEPRECATION")
                allowFileAccessFromFileURLs = true
                @Suppress("DEPRECATION")
                allowUniversalAccessFromFileURLs = true
                mediaPlaybackRequiresUserGesture = false
                cacheMode = WebSettings.LOAD_DEFAULT
                useWideViewPort = true
                loadWithOverviewMode = true
              }

              addJavascriptInterface(BoraScanJsInterface(ctx), "Android")

              webChromeClient =
                  object : WebChromeClient() {
                    override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                      android.util.Log.d("BoraScanWeb", "${consoleMessage?.message()} -- line ${consoleMessage?.lineNumber()}")
                      return true
                    }

                    override fun onPermissionRequest(request: PermissionRequest?) {
                      request?.grant(request.resources)
                    }

                    override fun onShowFileChooser(
                        webView: WebView?,
                        filePathCallback: ValueCallback<Array<Uri>>?,
                        fileChooserParams: FileChooserParams?
                    ): Boolean {
                      onLaunchFileChooser(filePathCallback, fileChooserParams?.acceptTypes)
                      return true
                    }
                  }

              webViewClient =
                  object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        view: WebView?,
                        url: String?
                    ): Boolean {
                      if (url == null) return false

                      // Handle WhatsApp and external links
                      if (url.startsWith("https://wa.me") ||
                          url.startsWith("whatsapp://") ||
                          url.startsWith("mailto:") ||
                          url.startsWith("tel:")) {
                        try {
                          val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                          ctx.startActivity(intent)
                          return true
                        } catch (e: Exception) {
                          e.printStackTrace()
                        }
                      }
                      return false
                    }
                  }

              loadUrl("file:///android_asset/web/index.html")
              webViewInstance = this
            }
          })
    }
  }
}
