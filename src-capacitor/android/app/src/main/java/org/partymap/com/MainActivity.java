package org.partymap.com;

import android.os.Bundle;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;
import android.os.Build;
import android.view.WindowManager;
import android.view.ViewGroup;
import android.view.View;
import android.view.Window;

public class MainActivity extends BridgeActivity {
  @Override
  public void onResume() {
    super.onResume();

    // Ensure the bridge is initialized before accessing it
    if (bridge != null) {
      WebSettings settings = bridge.getWebView().getSettings();
      settings.setTextZoom(100);
      settings.setSupportZoom(false);
    }
  }

/*
  @Override
  protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      Window window = getWindow();
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
       //  window.setNavigationBarColor(android.graphics.Color.TRANSPARENT);
      }
  }
  */

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= 35) {
          //  window.setNavigationBarContrastEnforced(false);

        }
         if (Build.VERSION.SDK_INT >= 30) {
                window.setDecorFitsSystemWindows(false);
        } else {
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

}
