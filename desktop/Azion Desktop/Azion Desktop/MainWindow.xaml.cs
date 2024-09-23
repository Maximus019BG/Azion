using Microsoft.Web.WebView2.Core;
using System;
using System.Windows;

namespace Azion_Desktop
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            await webViewControl.EnsureCoreWebView2Async(null);
            /*For tests use http://localhost:3000/login
            Don't forget to Change it
            TODO:Change it*/
            webViewControl.Source = new Uri("https://ev-f.vercel.app");
         
        }
    }
}
