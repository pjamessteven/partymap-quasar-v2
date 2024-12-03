package org.partymap.com;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

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
}
