   M S B A M L   `   `   `  ����e  aMicrosoft.Web.WebView2.Wpf, Version=1.0.2739.15, Culture=neutral, PublicKeyToken=2a8ab48044d2601ekLclr-namespace:Microsoft.Web.WebView2.Wpf;assembly=Microsoft.Web.WebView2.WpfMicrosoft.Web.WebView2.Wpf  5   	    Azion Desktop   Azion_Desktop.MainWindow   5   	   R NWindowsBase, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35W SPresentationCore, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35D 9http://schemas.microsoft.com/winfx/2006/xaml/presentation    5   	   R NSystem.Xaml, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml     5   	   \wpfLclr-namespace:Microsoft.Web.WebView2.Wpf;assembly=Microsoft.Web.WebView2.Wpf     5   	     � Title$  Azion Desktop��5   	   $
��1000��6   $
��1600��6-   
������� � WindowStyle$
 None=�5   	    � AllowsTransparency .  � 	Resources 5	         HoverButtonStyle �� 
TargetType �� Property �� Value �� Triggers P� Property	 P� Value  LoadingAnimation
 �� 
TargetName �� TargetProperty W� From	 W� To g� Duration g� RepeatBehavior��%  &	        &	 $    �� 5
   
   " ��6)   .�5      ��  � ��
 ���� 6+   �� 5       � ��
 �����6+   �� 5       � ��
 ���� 6,    5      P� 5       �@J�IsMouseOver	 . . �5      ��  � ��
 �  ��63   �� 5       � ��
 �����63   5      5      �� 5   
   .��5      W� $
 LoadingEllipse��5      $9 3(UIElement.RenderTransform).(RotateTransform.Angle)�5      $ 0X�5      $	 360X�6   $ 0:0:1D�6#   $ Forever��64   5      5      .��5      � 
�������.+�5!   
   � -   5        
���   �$��30��5!   "   $	��Top=�6.   .+�5"      �� $��/white-logo.png��6   $��5,0,46,0q�6-   $
��Left=�6?   �� 5#      $��Azion Desktop��6   $��Center=�6-   $��
38,0,-27,0q�6H   
�������$��16(�6o   $
��Bold"�6}    K� ZIndex$ 0��6�   � 5%      $��	0,0,-10,0q�6   $��Right=�6&   .+�5&      �� -   5        $��X��5&      $
��Bold"�6%   $��Right=�67   $��Center=�6S   $��
0,-5,18,-8q�6n   $��30��6�   $��40��6�    J� RenderTransformOrigin$ 0.511,0.525&�6�   
������ 
�������
������ $��16(�6  #��[  6,   � Cursor$ Arrow��6V  �� 5'      -   5        $	��☐��5'      $��
ExtraBlack"�6%   $��Right=�6=   $��Center=�6Y   $��31,-5,49,-8q�6t   $��30��6�   $��36��6�   
������ 
�������
������ $��16(�6�   $ 0.511,0.537&�6  #��[  61  �� 5(      -   5        $��_��5(      $��
ExtraBlack"�6%   $��Right=�6=   $��Center=�6Y   $��
0,-9,79,-5q�6t   $��30��6�   $��35��6�   
������ 
�������
������ $��16(�6  $ 	0.5,0.717&�6  #��[  62  5)      5*      � 5,   
   $��0,30,0,0q�6   .+�5/      �� $��Azion Desktop is Loading��6   $��Center=�68   $��Center=�6S   
���   �$ 1��6�   )   #Microsoft.Web.WebView2.Wpf.WebView2  50      -   5          Name$ webViewControl��50      $��Stretch=�63   $��Stretch=�6Q   $ 2��6m   51      53      '  !System.Windows.Shell.WindowChrome   WindowChrome 54        55   
      CaptionHeight$ 0Q�6      ResizeBorderThickness$ 5q�6)   57      