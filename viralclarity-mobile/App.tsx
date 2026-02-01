import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const STAGING_URL = 'https://viralclarityio-101.vercel.app';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <WebView
          source={{ uri: STAGING_URL }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#111827" />
            </View>
          )}
          onLoadStart={() => {
            setIsLoading(true);
            setErrorMessage(null);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={(event) => {
            const description = event.nativeEvent.description ?? 'Unknown error';
            setErrorMessage(`Load error: ${description}`);
          }}
          onHttpError={(event) => {
            setErrorMessage(`HTTP error: ${event.nativeEvent.statusCode}`);
          }}
        />
        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#111827" />
          </View>
        ) : null}
        {errorMessage ? (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#111827',
    fontSize: 14,
    textAlign: 'center',
  },
});
