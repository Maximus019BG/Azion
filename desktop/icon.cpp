#include <QIcon>
#include <QApplication>
#include <QFile>
#include <QDir>
#include <QDebug>
#include <QStandardPaths>
#include "manage.h"

#ifdef Q_OS_LINUX
void ensureIconExistsLinux() {
    QString sourceIconPath = QApplication::applicationDirPath() + "/assets/icon.png";
    QString targetIconPath = "/usr/share/pixmaps/AzionDesktopIcon.png";

    QFile file(targetIconPath);
    if (!file.exists()) {
        bool copied = QFile::copy(sourceIconPath, targetIconPath);
        if (!copied) {
            qDebug() << "Failed to copy icon to standard location.";
        }
    }
}
#endif

void ensureAppIcon() {
#ifdef Q_OS_LINUX
    ensureIconExistsLinux();
    QString iconPath = "/usr/share/pixmaps/AzionDesktopIcon.png";
#else
    QString assetPath = QApplication::applicationDirPath() + "/assets";
    QString iconPath = assetPath + "/icon.png";
#endif

    QIcon appIcon(iconPath);
    if (!appIcon.isNull()) {
        QApplication::setWindowIcon(appIcon);
    } else {
        qDebug() << "Icon file not found at:" << iconPath;
    }
}