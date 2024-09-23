using System;
using System.Windows;
using System.Windows.Media.Animation;
using System.Windows.Threading;

namespace Azion_Desktop
{
    public partial class LoadingWindow : Window
    {
        private DispatcherTimer timer;

        public LoadingWindow()
        {
            InitializeComponent();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            var loadingAnimation = (Storyboard)this.Resources["LoadingAnimation"];
            loadingAnimation.Begin();

            var textAnimation = (Storyboard)this.Resources["TextAnimation"];
            textAnimation.Begin();

            timer = new DispatcherTimer();
            timer.Interval = TimeSpan.FromSeconds(5);
            timer.Tick += Timer_Tick;
            timer.Start();
        }

        private void Timer_Tick(object sender, EventArgs e)
        {
            // Stop the timer and close the window after 5 seconds
            timer.Stop();
            this.Close();
        }
    }
}
