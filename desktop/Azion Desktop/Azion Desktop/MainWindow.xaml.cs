using Microsoft.Web.WebView2.Core;
using System;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;

namespace Azion_Desktop
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        public async Task InitializeWebViewAsync()
        {
            await webViewControl.EnsureCoreWebView2Async(null);

            // Set custom UserAgent 
            string platform = OSPlatform.Windows.ToString();
            webViewControl.CoreWebView2.Settings.UserAgent = $"AzionDesktop/1.0 {platform}";

            webViewControl.Source = new Uri("http://localhost:3000/login");
        }
        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
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
    }
}
