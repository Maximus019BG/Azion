using Microsoft.Web.WebView2.Core;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Security.Policy;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;

namespace Azion_Desktop
{
    public partial class MainWindow : Window
    {
        private string url = "http://localhost:3000/login";

        public MainWindow()
        {
            InitializeComponent();
            InitializeWebViewAsync();
        }

        public async Task InitializeWebViewAsync()
        {
            await webViewControl.EnsureCoreWebView2Async(null);

            // Set UserAgent
            string platform = OSPlatform.Windows.ToString() + " " + PlatformID.Win32NT.ToString();
            webViewControl.CoreWebView2.Settings.UserAgent = $"AzionDesktop/1.0 {platform}";
            webViewControl.CoreWebView2.Navigate(url);
            List<CoreWebView2Cookie> cookies = await GetCookiesAsync(url);
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
            Application.Current.Shutdown();
       
        }

        private void MinimizeButton_Click(object sender, RoutedEventArgs e)
        {
            this.WindowState = WindowState.Minimized;
        }

        private void FullScreen_Click(object sender, RoutedEventArgs e)
        {
            this.WindowState = this.WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
        }

        private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ClickCount == 2)
            {
                this.WindowState = this.WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
            }
            else
            {
                this.DragMove();
            }
        }

        public async Task<List<CoreWebView2Cookie>> GetCookiesAsync(string url)
        {
            await webViewControl.EnsureCoreWebView2Async(null);

            IReadOnlyList<CoreWebView2Cookie> cookies = await webViewControl.CoreWebView2.CookieManager.GetCookiesAsync(url);

            List<CoreWebView2Cookie> cookieList = new List<CoreWebView2Cookie>();

            foreach (var cookie in cookies)
            {
                if (cookie.Name == "azionAccessToken" || cookie.Name == "azionRefreshToken")
                {
                    cookieList.Add(cookie);
                    Console.WriteLine(cookie);
                }
            }

            return cookieList;
        }
    }
}
