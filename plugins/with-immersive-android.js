const { withMainActivity } = require('@expo/config-plugins');

module.exports = function withImmersiveAndroid(config) {
  return withMainActivity(config, (cfg) => {
    const isKotlin = cfg.modResults.language === 'kt';
    let src = cfg.modResults.contents;

    if (isKotlin) {
      if (!src.includes('WindowInsetsControllerCompat')) {
        // Add imports
        src = src.replace(
          /package [^\n]+\n/,
          (m) =>
            `${m}import android.os.Bundle\nimport android.view.View\nimport androidx.core.view.WindowCompat\nimport androidx.core.view.WindowInsetsCompat\nimport androidx.core.view.WindowInsetsControllerCompat\n`
        );
      }

      if (!src.includes('fun setImmersiveSticky')) {
        // Insert helper inside class body
        src = src.replace(
          /(class\s+MainActivity[^{]*\{)/,
          (m) =>
            `${m}
  private fun setImmersiveSticky() {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val decorView: View = window.decorView
    val controller = WindowInsetsControllerCompat(window, decorView)
    controller.hide(WindowInsetsCompat.Type.systemBars())
    controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
  }
`
        );
      }

      // Call in onCreate
      if (src.includes('super.onCreate(null)') && !src.includes('setImmersiveSticky()')) {
        src = src.replace('super.onCreate(null)', 'super.onCreate(null)\n    setImmersiveSticky()');
      }

      // onWindowFocusChanged override
      if (!src.includes('onWindowFocusChanged(')) {
        src = src.replace(
          /}\s*$/,
          `
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) setImmersiveSticky()
  }
}
`
        );
      }
    } else {
      // Java fallback
      if (!src.includes('WindowInsetsControllerCompat')) {
        src = src.replace(
          /package [^;]+;/,
          (m) =>
            `${m}
import android.os.Bundle;
import android.view.View;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
`
        );
      }

      if (!src.includes('void setImmersiveSticky()')) {
        src = src.replace(
          /(public class MainActivity[^\{]*\{)/,
          (m) =>
            `${m}
  private void setImmersiveSticky() {
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    View decorView = getWindow().getDecorView();
    WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(getWindow(), decorView);
    controller.hide(WindowInsetsCompat.Type.systemBars());
    controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
  }
`
        );
      }

      if (src.includes('super.onCreate(null)') && !src.includes('setImmersiveSticky();')) {
        src = src.replace('super.onCreate(null);', 'super.onCreate(null);\n    setImmersiveSticky();');
      }

      if (!src.includes('onWindowFocusChanged(boolean hasFocus)')) {
        src = src.replace(
          /}\s*$/,
          `
  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) setImmersiveSticky();
  }
}
`
        );
      }
    }

    cfg.modResults.contents = src;
    return cfg;
  });
};
