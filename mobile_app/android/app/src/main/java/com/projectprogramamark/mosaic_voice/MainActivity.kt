package com.projectprogramamark.mosaic_voice

import android.os.Build
import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

/* INSTRUCTIONS FOR CHRIS:

You need to download the model and push it onto the Android device using adb.
I was using an emulator, ymmv for physical device specific stuff.

In general, the following section from here should work:
https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/android#download-model

I downloaded the model using: `huggingface-cli download litert-community/Gemma3-1B-IT`
It will print out the path it downloaded it at. Go to that path.
Example, mine was at: ~/.cache/huggingface/hub/models--litert-community--Gemma3-1B-IT/snapshots/f565928ba69121fffded8db27e69525a9ffe1e61
So, I went to that directory and then did:
`adb push gemma3-1b-it-int4.task /data/local/tmp/llm/gemma3-1b-it-int4.task`
NOTE: Emulator must be running

The code below in the if (BuildConfig.DEBUG) block was a smoke test. It runs on build, to test that we can do inference.
You check if things passed by building the app:

`npx run android:ios`

I did gradle clean first for good measure:

```
cd android && ./gradlew clean ; cd ..
npx expo run:android
```

Then, in another terminal, whle app is building and running:
`adb logcat | grep SMOKE`

You should see a SMOKE-PASS pop up. If you see SMOKE-FAIL, paste it's output into GPT and it should help.
*/

// MediaPipe imports
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import android.util.Log
import java.io.File

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null)

    if (BuildConfig.DEBUG) {
      try {
        val modelPath = "/data/local/tmp/llm/gemma3-1b-it-int4.task"
        val opts = LlmInference.LlmInferenceOptions.builder()
          .setModelPath(modelPath)
          .setPreferredBackend(LlmInference.Backend.CPU)   // emulator-safe
          .setMaxTokens(16)
          .build()

        val llm = LlmInference.createFromOptions(this, opts)
        val txt = llm.generateResponse("ping")
        Log.i("SMOKE", "SMOKE-PASS: ${txt.take(50)}")

      } catch (t: Throwable) {
        Log.e("SMOKE", "SMOKE-FAIL", t)      // app stays open; no crash
      }
    }                     // close immediately – it’s only a test
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
