import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';

import {
  APP_WEB_URL,
  DEFAULT_PROD_URL,
  clearCustomWebUrl,
  getInitialWebUrl,
  saveCustomWebUrl,
} from '../config/env';

export default function AppWebView() {
  const webViewRef = useRef<WebView>(null);
  const [hasError, setHasError] = useState(false);
  const [url, setUrl] = useState(APP_WEB_URL);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUploadTips, setShowUploadTips] = useState(false);

  const handleRetry = useCallback(() => {
    setHasError(false);
    webViewRef.current?.reload();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialUrl = async () => {
      const initialUrl = await getInitialWebUrl();
      if (isMounted) {
        setUrl(initialUrl);
        setCustomUrlInput(initialUrl);
      }
    };
    void loadInitialUrl();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  const handleSetProduction = useCallback(() => {
    setUrl(DEFAULT_PROD_URL);
  }, []);

  const handleShowCustom = useCallback(() => {
    setShowCustomInput(true);
  }, []);

  const handleSaveCustom = useCallback(async () => {
    const trimmedUrl = customUrlInput.trim();
    if (!trimmedUrl) {
      return;
    }
    await saveCustomWebUrl(trimmedUrl);
    setUrl(trimmedUrl);
    setShowCustomInput(false);
  }, [customUrlInput]);

  const handleReset = useCallback(async () => {
    await clearCustomWebUrl();
    setUrl(APP_WEB_URL);
    setCustomUrlInput(APP_WEB_URL);
    setShowCustomInput(false);
  }, []);

  return (
    <View style={styles.container}>
      {__DEV__ ? (
        <View style={styles.devPanel}>
          <View style={styles.devRow}>
            <Pressable style={styles.devButton} onPress={handleSetProduction}>
              <Text style={styles.devButtonText}>Production</Text>
            </Pressable>
            <Pressable style={styles.devButton} onPress={handleShowCustom}>
              <Text style={styles.devButtonText}>Custom</Text>
            </Pressable>
            <Pressable style={styles.devButtonGhost} onPress={handleReset}>
              <Text style={styles.devButtonGhostText}>Reset</Text>
            </Pressable>
          </View>
          {showCustomInput ? (
            <View style={styles.devRow}>
              <TextInput
                value={customUrlInput}
                onChangeText={setCustomUrlInput}
                placeholder="https://your-url"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.devInput}
              />
              <Pressable style={styles.devButton} onPress={handleSaveCustom}>
                <Text style={styles.devButtonText}>Save</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={styles.tipsPanel}>
        <Pressable
          style={styles.tipsHeader}
          onPress={() => setShowUploadTips((prev) => !prev)}
        >
          <Text style={styles.tipsTitle}>Upload tips</Text>
          <Text style={styles.tipsToggle}>{showUploadTips ? 'Hide' : 'Show'}</Text>
        </Pressable>
        {showUploadTips ? (
          <Text style={styles.tipsBody}>
            If file picker doesn’t open, try again or use desktop.
          </Text>
        ) : null}
      </View>
      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Couldn’t load ViralClarity</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          key={url}
          ref={webViewRef}
          source={{ uri: url }}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          allowsInlineMediaPlayback
          domStorageEnabled
          javaScriptEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#111827" />
            </View>
          )}
          pullToRefreshEnabled
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  devPanel: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  devButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  devButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  devButtonGhost: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  devButtonGhostText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  devInput: {
    flex: 1,
    height: 32,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
    fontSize: 12,
  },
  tipsPanel: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  tipsToggle: {
    fontSize: 12,
    color: '#6b7280',
  },
  tipsBody: {
    marginTop: 6,
    fontSize: 12,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
