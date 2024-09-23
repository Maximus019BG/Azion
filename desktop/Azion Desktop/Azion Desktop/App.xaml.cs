using System;
using System.Windows;

namespace Azion_Desktop
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            LoadingWindow loadingWindow = new LoadingWindow();
            loadingWindow.Show();

            MainWindow mainWindow = new MainWindow();
  
            mainWindow.InitializeWebViewAsync().ContinueWith(_ =>
            {
                Dispatcher.Invoke(() =>
                {
                    loadingWindow.Close();
                    mainWindow.Show(); 
                });
            });
        }
    }
}
